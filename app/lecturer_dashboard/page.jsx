"use client";

import React, { useState, useEffect } from "react";
import { 
  FaCalendarAlt, 
  FaQrcode, 
  FaChalkboardTeacher,
  FaClock,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaExclamationCircle,
  FaUsers,
  FaUserCheck,
  FaSpinner,
  FaBook,
  FaChartLine,
  FaBell,
  FaUserGraduate,
  FaUniversity,
  FaArrowUp,
  FaArrowDown,
  FaEye
} from "react-icons/fa";
import SideNav from "../SideBar/page";
import styles from "./page.module.css";

// Mock data for lecturer's modules
const lecturerModules = [
  { 
    id: 1, 
    name: "Data Structures", 
    code: "CSC201", 
    course: "Bachelor of Science",
    students: 45,
    venue: "Science Lab A",
    schedule: "Monday 09:00-11:00",
    attendanceRate: 87
  },
  { 
    id: 2, 
    name: "Database Systems", 
    code: "INS301", 
    course: "Bachelor of Commerce",
    students: 52,
    venue: "Commerce Block 203",
    schedule: "Wednesday 11:00-13:00",
    attendanceRate: 92
  },
  { 
    id: 3, 
    name: "Advanced Agriculture", 
    code: "AGR401", 
    course: "Bachelor of Agriculture",
    students: 38,
    venue: "Agriculture Hall",
    schedule: "Friday 14:00-16:00",
    attendanceRate: 78
  },
  { 
    id: 4, 
    name: "Organic Chemistry", 
    code: "CHE202", 
    course: "Bachelor of Science",
    students: 41,
    venue: "Science Lab B",
    schedule: "Tuesday 10:00-12:00",
    attendanceRate: 94
  },
];

// Mock data for today's sessions
const todaySessions = [
  {
    id: 1,
    moduleName: "Data Structures",
    moduleCode: "CSC201",
    time: "09:00 - 11:00",
    venue: "Science Lab A",
    status: "Active",
    attendanceCount: 38,
    totalStudents: 45
  },
  {
    id: 2,
    moduleName: "Organic Chemistry",
    moduleCode: "CHE202",
    time: "10:00 - 12:00",
    venue: "Science Lab B",
    status: "Upcoming",
    attendanceCount: 0,
    totalStudents: 41
  }
];

// Mock data for recent activities
const recentActivities = [
  { id: 1, action: "QR Code generated for Data Structures", time: "2 minutes ago", type: "qr" },
  { id: 2, action: "Student enrolled in Database Systems", time: "1 hour ago", type: "enrollment" },
  { id: 3, action: "Attendance marked for Advanced Agriculture", time: "3 hours ago", type: "attendance" },
  { id: 4, action: "New student added to Organic Chemistry", time: "5 hours ago", type: "enrollment" },
  { id: 5, action: "Session completed for Database Systems", time: "1 day ago", type: "session" }
];

// Mock data for upcoming sessions
const upcomingSessions = [
  { id: 1, moduleName: "Database Systems", moduleCode: "INS301", date: "Tomorrow", time: "11:00 - 13:00", venue: "Commerce Block 203" },
  { id: 2, moduleName: "Advanced Agriculture", moduleCode: "AGR401", date: "Friday", time: "14:00 - 16:00", venue: "Agriculture Hall" }
];

// Mock data for recent results
const recentResults = [
  { id: 1, moduleName: "Data Structures", assessment: "Quiz 1", score: 87, avgScore: 82 },
  { id: 2, moduleName: "Database Systems", assessment: "Mid Exam", score: 92, avgScore: 88 },
  { id: 3, moduleName: "Organic Chemistry", assessment: "Quiz 2", score: 94, avgScore: 90 }
];

export default function LecturerDashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [greeting, setGreeting] = useState("");
  const [lecturerName, setLecturerName] = useState("Dr. Thabo Dlamini");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  // Calculate total statistics
  const totalStudents = lecturerModules.reduce((sum, m) => sum + m.students, 0);
  const totalModules = lecturerModules.length;
  const avgAttendance = Math.round(lecturerModules.reduce((sum, m) => sum + m.attendanceRate, 0) / totalModules);
  const activeSessions = todaySessions.filter(s => s.status === "Active").length;

  const getAttendanceColor = (rate) => {
    if (rate >= 90) return "#2ecc71";
    if (rate >= 80) return "#ffb81c";
    if (rate >= 70) return "#e67e22";
    return "#c8102e";
  };

  const getActivityIcon = (type) => {
    switch(type) {
      case "qr": return <FaQrcode />;
      case "enrollment": return <FaUserGraduate />;
      case "attendance": return <FaUserCheck />;
      case "session": return <FaCalendarAlt />;
      default: return <FaBell />;
    }
  };

  return (
    <div className={styles.container}>
      <SideNav collapsed={collapsed} setCollapsed={setCollapsed} />
      
      <main className={`${styles.mainContent} ${collapsed ? styles.mainCollapsed : styles.mainExpanded}`}>
        
        {/* Welcome Header */}
        <div className={styles.welcomeHeader}>
          <div className={styles.welcomeText}>
            <h1>{greeting}, <span className={styles.lecturerName}>{lecturerName}</span> 👋</h1>
            <p>Welcome to your lecturer dashboard. Manage your modules, track attendance, and generate QR codes.</p>
          </div>
          <div className={styles.dateBadge}>
            <FaCalendarAlt className={styles.dateIcon} />
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        {/* Stats Cards */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ color: "#c8102e" }}>
              <FaBook />
            </div>
            <div className={styles.statInfo}>
              <h3>{totalModules}</h3>
              <p>My Modules</p>
              <span className={styles.statChange}>↑ 1 this semester</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ color: "#ffb81c" }}>
              <FaUsers />
            </div>
            <div className={styles.statInfo}>
              <h3>{totalStudents}</h3>
              <p>Total Students</p>
              <span className={styles.statChange}>Across all modules</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ color: "#2ecc71" }}>
              <FaUserCheck />
            </div>
            <div className={styles.statInfo}>
              <h3>{avgAttendance}%</h3>
              <p>Avg Attendance</p>
              <span className={styles.statChange}>↑ 5% from last month</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ color: "#4a9eff" }}>
              <FaQrcode />
            </div>
            <div className={styles.statInfo}>
              <h3>{activeSessions}</h3>
              <p>Active Sessions</p>
              <span className={styles.statChange}>Today's QR sessions</span>
            </div>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className={styles.mainGrid}>
          
          {/* Left Column - Today's Sessions */}
          <div className={styles.leftColumn}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>
                  <FaCalendarAlt className={styles.cardIcon} />
                  Today's Sessions
                </h3>
                <span className={styles.liveBadge}>LIVE</span>
              </div>
              <div className={styles.sessionsList}>
                {todaySessions.map((session) => (
                  <div key={session.id} className={styles.sessionItem}>
                    <div className={styles.sessionInfo}>
                      <div className={styles.sessionName}>{session.moduleName}</div>
                      <div className={styles.sessionCode}>{session.moduleCode}</div>
                      <div className={styles.sessionMeta}>
                        <span><FaClock /> {session.time}</span>
                        <span><FaMapMarkerAlt /> {session.venue}</span>
                      </div>
                    </div>
                    <div className={styles.sessionStatus}>
                      <span className={session.status === "Active" ? styles.statusActive : styles.statusUpcoming}>
                        {session.status}
                      </span>
                      <div className={styles.attendanceInfo}>
                        <FaUsers /> {session.attendanceCount}/{session.totalStudents}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className={styles.cardFooter}>
                <button className={styles.viewAllBtn}>View All Sessions →</button>
              </div>
            </div>

            {/* Upcoming Sessions */}
        
          </div>

          {/* Center Column - My Modules */}
          <div className={styles.centerColumn}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>
                  <FaBook className={styles.cardIcon} />
                  My Modules
                </h3>
                <button className={styles.cardAction}>View All</button>
              </div>
              <div className={styles.modulesList}>
                {lecturerModules.map((module) => (
                  <div key={module.id} className={styles.moduleItem}>
                    <div className={styles.moduleInfo}>
                      <div className={styles.moduleCode}>{module.code}</div>
                      <div className={styles.moduleName}>{module.name}</div>
                      <div className={styles.moduleCourse}>{module.course}</div>
                    </div>
                    <div className={styles.moduleStats}>
                      <div className={styles.moduleStudents}>
                        <FaUsers /> {module.students}
                      </div>
                      <div className={styles.moduleAttendance}>
                        <div className={styles.progressBarTrack}>
                          <div 
                            className={styles.progressBarFill}
                            style={{ width: `${module.attendanceRate}%`, backgroundColor: getAttendanceColor(module.attendanceRate) }}
                          />
                        </div>
                        <span className={styles.attendanceRate}>{module.attendanceRate}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Results */}
            
          </div>

          {/* Right Column - Recent Activity */}
          <div className={styles.rightColumn}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>
                  <FaBell className={styles.cardIcon} />
                  Recent Activity
                </h3>
                <span className={styles.liveBadge}>LIVE</span>
              </div>
              <div className={styles.activityList}>
                {recentActivities.map((activity) => (
                  <div key={activity.id} className={styles.activityItem}>
                    <div className={styles.activityIcon}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className={styles.activityInfo}>
                      <div className={styles.activityAction}>{activity.action}</div>
                      <div className={styles.activityTime}>{activity.time}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className={styles.cardFooter}>
                <button className={styles.viewAllBtn}>View All →</button>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
         <p>© {new Date().getFullYear()} University of Eswatini - Lecturer Dashboard</p>
        </div>
      </main>
    </div>
  );
}