const Alert = ({ message, type }) => {
    const alertStyles = {
      success: "bg-green-100 border-l-4 border-green-500 text-green-800",
      error: "bg-red-100 border-l-4 border-red-500 text-red-800",
      warning: "bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800",
      info: "bg-blue-100 border-l-4 border-blue-500 text-blue-800",
    };
  
    return (
      <div className={`p-4 my-2 rounded-md ${alertStyles[type]}`}>
        {message}
      </div>
    );
  };
  
  export default Alert;
  