import React from "react";

const Loader = () => (
  <div style={{
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    backgroundColor: "#fff", // istasangiz fondi bo‘lsin
    zIndex: 9999
  }}>
    <span className="admin-spinner" style={{ marginBottom: 10 }}></span>
    <div>Loading...</div>
  </div>
);

export default Loader;
