import { Link } from "react-router-dom";

const MenuBox = ({ name, url }) => {
  return (
    <Link to={`/${url}`} className="group">
      <div className="p-6 md:p-8 w-full bg-white/20 backdrop-blur-lg shadow-2xl rounded-2xl transition-all duration-300 transform hover:scale-110 hover:bg-white/30 border border-white/20 text-center cursor-pointer">
        <h2 className="text-lg md:text-xl font-semibold group-hover:text-blue-300 transition-colors duration-300">
          {name}
        </h2>
      </div>
    </Link>
  );
};

export default MenuBox;

