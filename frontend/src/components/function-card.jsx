import React from "react";
import { useNavigate } from "react-router-dom";

const FunctionCard = ({ cardDetails }) => {
    const navigate = useNavigate();

    const navigateTo = () => { 
        navigate(cardDetails["route"]);
    };

    return (
        <div className="card bg-base-100 w-full max-w-md mx-auto shadow-md rounded-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-lg hover:bg-gray-50">
            <figure className="flex justify-center items-center w-full py-6 bg-gray-100 transition-all duration-300">
                <img
                    src={cardDetails.icon}
                    alt={cardDetails.name}
                    className="mt-5 w-24 h-24 md:w-32 md:h-32 transition-all duration-300"
                />
            </figure>

            <div className="card-body p-6">
                <h2 className="card-title text-2xl font-semibold">{cardDetails.name}</h2>
                <p className="text-gray-600">{cardDetails.description}</p>

                <div className="card-actions justify-end">
                    <button 
                        onClick={navigateTo} 
                        className="btn btn-primary px-5 py-2 text-lg transition-all duration-300 hover:bg-blue-600"
                    >
                        {cardDetails["button-name"]}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FunctionCard;
