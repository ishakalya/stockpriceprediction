from flask import Flask, request, jsonify
from flask_cors import CORS
import yfinance as yf
import numpy as np
from tensorflow.keras.models import load_model
from sklearn.preprocessing import MinMaxScaler
import datetime as dt

app = Flask(__name__)
CORS(app)

print("✅ Loading model...")
model = load_model("lstm_model.h5")
print("✅ Model loaded.")

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()
    stock = data.get("stock", "AAPL")

    try:
        # Load stock data
        end = dt.datetime.now()
        start = dt.datetime(2024, 1, 1)
        df = yf.Ticker(stock).history(start=start, end=end)

        if df.empty or "Close" not in df.columns:
            raise Exception("Invalid stock data or ticker may be delisted.")

        df1 = df['Close'].reset_index(drop=True)

        # Scale
        scaler = MinMaxScaler(feature_range=(0, 1))
        df1_scaled = scaler.fit_transform(np.array(df1).reshape(-1, 1))

        # Get last 100 values to start prediction
        last_100_scaled = df1_scaled[-100:]
        temp_input = list(last_100_scaled.reshape(1, -1)[0])
        lst_output = []

        # Predict next 30 days
        for _ in range(30):
            x_input = np.array(temp_input[-100:]).reshape(1, 100, 1)
            yhat = model.predict(x_input, verbose=0)
            temp_input.append(yhat[0][0])
            lst_output.append(yhat[0][0])

        # Inverse transform
        predictions = scaler.inverse_transform(np.array(lst_output).reshape(-1, 1)).flatten().tolist()
        last_100_actual = scaler.inverse_transform(last_100_scaled).flatten().tolist()

        return jsonify({
            "last100": last_100_actual,
            "predictions": predictions
        })

    except Exception as e:
        print("❌ Error:", str(e))
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    print("🚀 Starting Flask backend...")
    app.run(host="0.0.0.0", port=5000)

