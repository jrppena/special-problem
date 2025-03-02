import React from "react";
import FunctionCard from "./function-card";
import { roleFunctions } from "../constants";

const CardGridContainer = ({ currentRole }) => {

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mx-auto mt-10 px-10">
            {roleFunctions[currentRole]?.map((cardDetails, index) => {
                console.log("Rendering:", cardDetails);
                return <FunctionCard key={index} cardDetails={cardDetails} />;
            })}
        </div>
    );
};

export default CardGridContainer;
