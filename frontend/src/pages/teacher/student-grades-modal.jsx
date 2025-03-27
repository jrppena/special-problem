import React from 'react';
import { X, Award, Star, Trophy, Gem } from 'lucide-react';

const getHonorsClassification = (grade) => {
  // If grade is not a valid number or is empty/null, return standard classification
  if (grade === null || grade === undefined || isNaN(parseFloat(grade))) {
    return { 
      text: 'Incomplete', 
      color: 'bg-yellow-100 text-yellow-800', 
      icon: <Award size={16} /> 
    };
  }

  const numGrade = parseFloat(grade);
  if (numGrade >= 98) return { text: 'With Highest Honors', color: 'bg-purple-100 text-purple-800', icon: <Gem size={16} /> };
  if (numGrade >= 95) return { text: 'With High Honors', color: 'bg-blue-100 text-blue-800', icon: <Trophy size={16} /> };
  if (numGrade >= 90) return { text: 'With Honors', color: 'bg-green-100 text-green-800', icon: <Star size={16} /> };
  return { text: 'Standard', color: 'bg-gray-100 text-gray-800', icon: <Award size={16} /> };
};

const calculateOverallAverage = (quarterAverages) => {
  // Filter out non-numeric values before calculating average
  const validAverages = Object.values(quarterAverages)
    .filter(avg => avg !== null && avg !== undefined && !isNaN(parseFloat(avg)));
  
  // If no valid averages, return null
  if (validAverages.length === 0) return null;

  // Calculate average of valid numeric values
  return (validAverages.reduce((a, b) => a + parseFloat(b), 0) / validAverages.length).toFixed(2);
};

const StudentGradesModal = ({ grades, studentName, onClose }) => {
  if (!grades) return null;

  // Calculate overall average
  const overallAverage = calculateOverallAverage(grades.quarterAverages);
  const overallHonors = overallAverage 
    ? getHonorsClassification(overallAverage) 
    : { 
        text: 'Incomplete', 
        color: 'bg-yellow-100 text-yellow-800', 
        icon: <Award size={16} /> 
      };

  return (
    <div className="fixed inset-0 flex justify-center items-center z-50 bg-black/30 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-2xl w-11/12 max-w-4xl max-h-[90vh] overflow-auto relative shadow-2xl">
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={24} />
        </button>
        
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">{studentName}</h2>
              <p className="text-gray-500">Academic Performance Report</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {overallAverage || 'N/A'}
              </div>
              <div className={`px-3 py-1 rounded-full ${overallHonors.color} text-sm flex items-center gap-1`}>
                {overallHonors.icon}
                {overallHonors.text}
              </div>
            </div>
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
        </div>

        {/* Quarterly Averages Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Object.entries(grades.quarterAverages).map(([quarter, average]) => {
            const { text, color, icon } = getHonorsClassification(average);
            return (
              <div key={quarter} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Q{quarter.slice(1)}</span>
                  {icon}
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-bold text-gray-900">
                    {average || 'N/A'}
                  </div>
                  <div className={`mt-1 px-2 py-1 rounded-full ${color} text-xs w-fit`}>
                    {text}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Subject Grades Table */}
        <div className="rounded-xl border border-gray-100 overflow-hidden shadow-sm">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Subject</th>
                {['Q1', 'Q2', 'Q3', 'Q4'].map((q) => (
                  <th key={q} className="px-4 py-3 text-center text-sm font-medium text-gray-500">{q}</th>
                ))}
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Average</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {grades.classes.map((classGrade) => (
                <tr key={classGrade.classId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{classGrade.className}</td>
                  {['Q1', 'Q2', 'Q3', 'Q4'].map((q) => (
                    <td key={q} className="px-4 py-3 text-center text-gray-600">
                      {classGrade.grades[q] || 'N/A'}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-center font-semibold text-blue-600">
                    {classGrade.average || 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Note */}
        <div className="mt-6 text-sm text-gray-500 text-center">
          * Grades are based on quarterly assessments and academic performance
        </div>
      </div>
    </div>
  );
};

export default StudentGradesModal;