// IssueDisplayCard.jsx
import React from "react";
import { FaThumbsUp, FaComment } from "react-icons/fa";

const IssueDisplayCard = ({ issue }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "Resolved":
        return "bg-green-100 text-green-800";
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "Reported":
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4 border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-lg text-gray-800">{issue.title}</h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
          {issue.status}
        </span>
      </div>
      
      <p className="text-gray-600 mb-3">{issue.description}</p>
      
      <div className="flex justify-between items-center text-sm text-gray-500">
        <div>
          <span className="font-medium">Location:</span> {issue.location}
        </div>
        <div>
          <span className="font-medium">Date:</span> {issue.date}
        </div>
      </div>
      
      <div className="flex justify-between items-center mt-3">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <FaThumbsUp className="text-blue-500 mr-1" />
            <span>{issue.upvotes}</span>
          </div>
          <div className="flex items-center">
            <FaComment className="text-gray-500 mr-1" />
            <span>{issue.comments}</span>
          </div>
        </div>
        
        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs">
          {issue.category}
        </span>
      </div>
    </div>
  );
};

export default IssueDisplayCard;