import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  

  return (
    <nav>
      <div> MyWebsite</div>
      <ul>
        <li>
          <Link to="/">
            Home
          </Link>
        </li>
        <li>
          <Link to="/courses">
            Courses
          </Link>
        </li>
      </ul>
          
    </nav>
  );
};

export default Navbar;




    
