import React, { useEffect, useState } from "react";
import * as NGL from "ngl";

let stage;
let struc;

export default function ProteinViewer(props) {
  const [tooltip, setTooltip] = useState({
    text: "",
    x: 0,
    y: 0,
  });
  const [reprs, setReprs] = useState({
    contact: 0,
    cartoon: 0,
    neighbor: 0,
    focus: 0,
  });

  useEffect(() => {
    console.log("running");
    document.getElementById("viewport").innerHTML = "";
    stage = new NGL.Stage("viewport", {
      backgroundColor: "#161409",
      ambientColor: "white",
      clipDist: 10,
    });

    window.addEventListener(
      "resize",
      function(event) {
        stage.handleResize();
      },
      false
    );

    function loadStructure(input) {
      stage.setFocus(0);

      stage.removeAllComponents();
      stage.mouseControls.remove("hoverPick");

      function generateTooltip(pickingProxy){
        if (pickingProxy && (pickingProxy.atom || pickingProxy.bond || pickingProxy.contact)) {
          console.log(pickingProxy)
          let atom = {};
          if (pickingProxy.atom) {
            atom = pickingProxy.atom;
            setTooltip({
              name: `${atom.resname} ${atom.chainname} ${atom.resno}`,
              x: pickingProxy.mouse.position.x,
              y: pickingProxy.mouse.position.y,
            });
          } else if (pickingProxy.bond){
            atom = pickingProxy.bond.atom1;
            setTooltip({
              name: `${atom.resname} ${atom.chainname} ${atom.resno}`,
              x: pickingProxy.mouse.position.x,
              y: pickingProxy.mouse.position.y,
            });
          } else {
            const atom1 = pickingProxy.contact.atom1;
            const atom2 = pickingProxy.contact.atom2;
            
            setTooltip({
              name: `${atom1.resname} ${atom1.chainid} ${atom1.resno} - ${pickingProxy.contact.type} - ${atom2.resname} ${atom2.chainid} ${atom2.resno}`,
              x: pickingProxy.mouse.position.x,
              y: pickingProxy.mouse.position.y,
            });

          }

        }
      };

      stage.signals.hovered.add(generateTooltip) 
      stage.signals.clicked.add(generateTooltip) 

      return stage.loadFile(input).then(function(o) {
        console.log(o);
        o.setDefaultAssembly()
        o.autoView();

        let cartoonRepr = o.addRepresentation("cartoon", {
          visible: true,
        });
        let contactRepr = o.addRepresentation("contact", {
          sele: "none",
          radiusSize: 0.07,
          weakHydrogenBond: false,
          waterHydrogenBond: false,
          backboneHydrogenBond: true,
          hydrogenBond: true,
        });

        let neighborRepr = o.addRepresentation("line", {
          sele: "none",
          scale: 2.0,
          colorValue: "lightgrey",
          multipleBond: "symmetric",
          opacity: 0.8,
        });
        let focusRepr = o.addRepresentation("ball+stick", {
          multipleBond: "symmetric",
          colorValue: "green",
          sele: "none",
          scale: 1.0,
        });

        setReprs({
          cartoon: cartoonRepr,
          contact: contactRepr,
          neighbor: neighborRepr,
          focus: focusRepr,
        });
        console.log(cartoonRepr);
        struc = o;
      });
    }

    loadStructure(`rcsb://${[props.pdb]}`);
  }, [props.pdb]);

  function showRegion() {
    if (!props.chain | !props.seq) {
      if (reprs.cartoon != 0) {
        reprs.cartoon.setVisibility(true);
        reprs.contact.setVisibility(false);
        reprs.neighbor.setVisibility(false);
        reprs.focus.setVisibility(false);
        reprs.cartoon.setSelection("not ( water or ACE or NH2 )");
        reprs.cartoon.setParameters({ opacity: 1.0 });
        struc.autoView("all", 2000);
      }
      return;
    }

    const s = struc.structure;
    console.log(stage);

    let sele = ":" + props.chain.toUpperCase() + " and " + props.seq;
    console.log(sele);

    const withinSele = s.getAtomSetWithinSelection(new NGL.Selection(sele), 8);
    const withinGroup = s.getAtomSetWithinGroup(withinSele);
    let expandedSele = withinGroup.toSeleString();
    let neighborSele = "(" + expandedSele + ") and not (" + sele + ")";
    neighborSele = expandedSele;
    console.log(expandedSele);

    expandedSele = expandedSele + " and not ( water or ACE or NH2 )"
    neighborSele = neighborSele + " and not ( water or ACE or NH2 )"
    sele = sele + " and not ( water or ACE or NH2 )"

    reprs.cartoon.setVisibility(true);
    reprs.contact.setVisibility(true);
    reprs.neighbor.setVisibility(true);
    reprs.focus.setVisibility(true);

    reprs.cartoon.setSelection("not ( water or ACE or NH2 )");

    reprs.cartoon.setParameters({ opacity: 0.4 });

    reprs.contact.setSelection(expandedSele);
    reprs.neighbor.setSelection(neighborSele);
    reprs.focus.setSelection(sele);

    console.log(reprs.contact);

    struc.autoView(sele, 2000);
  }

  useEffect(() => {
    showRegion();
  }, [props.chain, props.seq])

  return (
    <>
      <h1 className="tool_tip">{props.pdb}:&nbsp;{struc ? struc.object.title : ""}</h1>
      <div id="viewport" className="protein-window"></div>
      <h1 className="tool_tip">{tooltip.name}</h1>
    </>
  );
}
