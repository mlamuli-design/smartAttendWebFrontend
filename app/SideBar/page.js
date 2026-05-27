"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  FaClipboard, 
  FaChartLine, 
  FaBook, 
  FaCogs, 
  FaUserCircle, 
  FaChevronDown, 
  FaChevronRight,
  FaTachometerAlt,
  FaUniversity,
  FaSignOutAlt,
  FaBell,
  FaSearch,
  FaRegSmile,
  FaChalkboardTeacher, 
  FaUserGraduate ,
  FaBookOpen,
} from "react-icons/fa";
import styles from "./SideNav.module.css";
import { FaPerson } from "react-icons/fa6";

export default function SideNav({ collapsed, setCollapsed }) {
  const router = useRouter();

  const [role, setRole] = useState(null);
  const [username, setUsername] = useState(null);
  const [openDropdowns, setOpenDropdowns] = useState({});

  useEffect(() => {
    if (typeof window !== "undefined") {
      setRole(localStorage.getItem("role"));
      setUsername(localStorage.getItem("username"));
    }
  }, []);

  const routes = {

    //Admin routes
    "Admin login": "/admin_login",
    "Admin Dashboard": "/admin_dashboard",
    "Manage Courses": "/course_management",
    "Manage Modules": "/module-management",
    "Manage Lecturers": "/department_management",
    "Manage Students": "/audit_logs",


    //Lecturer routes
    "Session Management": "/session_management",
    "Student Management": "/realtime_attendance",
    "Dashboard": "/lecturer_dashboard",



/*
    "Profile & Settings": "/profile_settings",
    "Role-based access": "/role_access",
    "Audit logs": "/audit_logs",
    
    "Department listing": "/department_listing",
    "System overview": "/system_overview",
    "Total users": "/total_users",
    "System health": "/system_health",
    "Recent activities": "/recent_activities",
    "Create/Edit/Delete modules": "/module_crud",
    "Assign lecturers": "/assign_lecturers",
    */
  };

  const lecturerMenu = [
     {
      name: "Dashboard",
      icon: <FaTachometerAlt />,
      items: [],
    },
    {
      name: "Session Management",
      icon: <FaBook />,
      items: ["Manage Session"],
    },
     
    {
      name: "Student Management",
      icon: <FaBook />,
      items: ["Manage Student"],
    },
    
  ];

  const adminMenu = [
   
    {
      name: "Dashboard",
      icon: <FaTachometerAlt />,
      items: ["Admin Dashboard"],
    },
    {
      name: "Course Management",
      icon: <FaBook />,
      items: ["Manage Courses"],
    },
      {
      name: "Lecturer Management",
      icon: <FaChalkboardTeacher  />,
      items: ["Manage Lecturers"],
    },
    {
      name: "Module Management",
      icon: <FaBookOpen />,
      items: ["Manage Modules"],
    },
    {
      name: "Student Management",
      icon: <FaUserGraduate/>,
      items: ["Manage Students"],
    },
     
  ];

  const menu = role === "admin" ? adminMenu : role === "lecturer" ? lecturerMenu : [];

  const toggleDropdown = (index) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleNavigation = (name) => {
    const path = routes[name];
    if (path) {
      router.push(path);
    } else {
      console.warn("No route defined for:", name);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push("/");
  };

  return (
    <div className={`${styles.sideNav} ${collapsed ? styles.collapsed : styles.expanded}`}>
      {/* Glass header with bottle-style */}
      <div className={styles.header}>
        {!collapsed && (
          <div className={styles.brand}>
            <div className={styles.logo}>
              <span className={styles.logoRed}>U</span>
              <span className={styles.logoBlue}>N</span>
              <span className={styles.logoGold}>E</span>
              <span className={styles.logoRed}>S</span>
              <span className={styles.logoBlue}>W</span>
              <span className={styles.logoGold}>A</span>
            </div>
            <span className={styles.brandText}>University of Eswatini</span>
          </div>
        )}
        {collapsed && (
          <div className={styles.logoCompact}>
            <span className={styles.logoRed}>U</span>
            <span className={styles.logoBlue}>E</span>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)} className={styles.collapseBtn}>
          {collapsed ? "→" : "←"}
        </button>
      </div>

      {/* Slack-style status & search (only when expanded) */}
      {!collapsed && (
        <div className={styles.slackBar}>
          <div className={styles.statusBadge}>
            <span className={styles.statusDot}></span>
            <span>Online · {role || "Guest"}</span>
          </div>
        
        </div>
      )}

      {/* Role Badge - Bottle style pill */}
      {!collapsed && role && (
        <div className={styles.roleBadge}>
          <FaRegSmile className={styles.roleIcon} />
          <span className={styles.roleText}>{role.toUpperCase()} PORTAL</span>
        </div>
      )}

      {/* Menu */}
      <ul className={styles.menuList}>
        {menu.map((item, index) => {
          if (role === "admin") {
            return (
              <li key={index} className={styles.menuItem}>
                <div
                  className={styles.dropdownHeader}
                  onClick={() => toggleDropdown(index)}
                >
                  <div className={styles.menuIcon}>
                    {collapsed ? item.icon : item.icon}
                  </div>
                  {!collapsed && (
                    <>
                      <span className={styles.menuName}>{item.name}</span>
                      <span className={styles.dropdownIcon}>
                        {openDropdowns[index] ? <FaChevronDown /> : <FaChevronRight />}
                      </span>
                    </>
                  )}
                </div>

                {openDropdowns[index] && !collapsed && (
                  <ul className={styles.subMenu}>
                    {item.items.map((subItem, subIndex) => (
                      <li
                        key={subIndex}
                        className={styles.subMenuItem}
                        onClick={() => handleNavigation(subItem)}
                      >
                        <span className={styles.subItemDot}></span>
                        {subItem}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          } else {
            return (
              <li
                key={index}
                className={styles.menuItem}
                onClick={() => handleNavigation(item.name)}
              >
                <div className={styles.menuLink}>
                  <span className={styles.menuIcon}>
                    {collapsed ? item.icon : item.icon}
                  </span>
                  {!collapsed && <span className={styles.menuName}>{item.name}</span>}
                </div>
              </li>
            );
          }
        })}
      </ul>

      {/* Bottom Profile Section - Logout ALWAYS visible */}
      <div className={styles.profileSection}>
        <div className={styles.profileIcon}>
          {role === "admin" ? <FaCogs /> : <FaUserCircle />}
        </div>
        {!collapsed && (
          <div className={styles.profileInfo}>
            <p className={styles.profileName}>
              {role === "admin" ? "Administrator" : username || "User"}
            </p>
            <p className={styles.profileRole}>{role || "Guest"}</p>
          </div>
        )}
        {/* Logout button - ALWAYS visible, even when collapsed */}
        <button onClick={handleLogout} className={styles.logoutBtn} title="Logout">
          <FaSignOutAlt />
        </button>
      </div>

      {/* Slack-style footer message (only expanded) */}
      {!collapsed && (
        <div className={styles.footerMessage}>
          <FaBell className={styles.footerIcon} />
          <span>v2.0 · Ready for class</span>
        </div>
      )}
    </div>
  );
}