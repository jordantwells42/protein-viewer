import ProteinViewer from "./components/protein";
import React, { useState } from "react";
import "./App.css";

function App() {
  const [pdb, setPdb] = useState("2wet");
  const [inpSele, setInpSele] = useState({ chain: "", seq: "" });

  function handleSubmit(event) {
    event.preventDefault();
    console.log(event);
    setPdb(event.target[0].value);
  }

  function handleChange(event) {
    setInpSele((prevSele) => ({
      ...prevSele,
      [event.target.name]: event.target.value,
    }));
  }

  return (
    <div className="App mx-auto">
      <div className="container-fluid py-3">
        <div className="row">
          <div className="col-lg-2 px-1 justify-content-center">
            <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  name="pdb"
                  className="pdbInput"
                  placeholder="PDB ID (e.g. 2WET)"
                />
                <button className = "text-center" type="submit">LOAD</button>
            </form>
            <form>
                <input
                  type="text"
                  name="chain"
                  onChange={handleChange}
                  value={inpSele.chain}
                  placeholder="Chain ID (e.g. A)"
                />
                <input
                  type="text"
                  name="seq"
                  onChange={handleChange}
                  value={inpSele.seq}
                  placeholder="Position (e.g. 10)"
                />
            </form>
          </div>
        
        <div className="col-lg-10 px-5">
          <ProteinViewer pdb={pdb} chain={inpSele.chain} seq={inpSele.seq} />
        </div>
      </div>
      </div>
    </div>
  );
}

export default App;
