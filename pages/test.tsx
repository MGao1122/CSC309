import React from "react";
import StaticBlobs from "../components/Background";

const Home: React.FC = () => {
  return (
    <>
      <StaticBlobs />
      <div style={{ position: "relative", color: "white", zIndex: 1, textAlign: "center", paddingTop: "50px" }}>
        <h1>Static Blob Background</h1>
        <p>Welcome to a beautiful static blob design!</p>
      </div>
    </>
  );
};

export default Home;
