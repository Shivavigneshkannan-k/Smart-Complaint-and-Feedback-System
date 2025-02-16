const MenuButton = ({ icon: Icon, text, onClick }) => {
  return (
    <center>
      <button
        onClick={onClick}
        className="w-full sm:w-64 h-48 bg-white rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-center gap-4 group p-6"
      >
        <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors duration-300">
          <Icon className="w-8 h-8 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
        </div>
        <span className="text-lg font-semibold text-gray-800 text-center">{text}</span>
      </button>
    </center>
  );
};

export default MenuButton;
