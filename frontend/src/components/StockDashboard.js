import React, { useState } from "react";
import axios from "axios";
import Plot from "react-plotly.js";

function StockDashboard() {
    const [stock, setStock] = useState("AAPL");
    const [plotData, setPlotData] = useState(null);

    const fetchPrediction = async () => {
        const res = await axios.post("https://stockpriceprediction-kvon.onrender.com/predict", { stock })


        const last100 = res.data.last100;
        const predictions = res.data.predictions;
        const actualX = Array.from({ length: 100 }, (_, i) => i + 1);
        const futureX = Array.from({ length: 30 }, (_, i) => i + 101);

        setPlotData([
            {
                x: actualX,
                y: last100,
                type: "scatter",
                mode: "lines",
                name: "Actual",
                line: { color: "orange", width: 2 }
            },
            {
                x: futureX,
                y: predictions,
                type: "scatter",
                mode: "lines+markers",
                name: "Predicted",
                line: { color: "blue", width: 2 }
            }
        ]);
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={{ marginBottom: 20 }}>📈 Stock Price Predictor</h2>
                <div style={styles.inputGroup}>
                    <input
                        style={styles.input}
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                        placeholder="Enter stock symbol (e.g. AAPL)"
                    />
                    <button style={styles.button} onClick={fetchPrediction}>
                        Predict
                    </button>
                </div>

                {plotData && (
                    <Plot
                        data={plotData}
                        layout={{
                            title: `30-Day Forecast for ${stock.toUpperCase()}`,
                            xaxis: { title: "Days" },
                            yaxis: { title: "Price ($)" },
                            plot_bgcolor: "#f8f9fa",
                            paper_bgcolor: "#f8f9fa",
                            autosize: true,
                        }}
                        useResizeHandler
                        style={{ width: "100%", height: "100%" }}
                    />
                )}
            </div>
        </div>
    );
}

const styles = {
    container: {
        minHeight: "100vh",
        backgroundColor: "#e9ecef",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    card: {
        backgroundColor: "#fff",
        padding: 30,
        borderRadius: 12,
        boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
        maxWidth: 1000,
        width: "100%",
    },
    inputGroup: {
        display: "flex",
        gap: 10,
        marginBottom: 30,
    },
    input: {
        flex: 1,
        padding: "10px 12px",
        fontSize: 16,
        borderRadius: 6,
        border: "1px solid #ccc",
    },
    button: {
        backgroundColor: "#007bff",
        color: "#fff",
        border: "none",
        padding: "10px 16px",
        fontSize: 16,
        borderRadius: 6,
        cursor: "pointer",
    },
};

export default StockDashboard;
