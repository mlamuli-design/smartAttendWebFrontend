"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";
import SideNav from "../SideBar/page";
import { 
  FaUniversity, 
  FaBook, 
  FaChalkboardTeacher, 
  FaUsers, 
  FaCube, 
  FaCalendarCheck,
  FaChartLine,
  FaUserGraduate,
  FaBell,
  FaSearch,
  FaUserCircle,
  FaQrcode,
  FaClock,
  FaCheckCircle,
  FaSpinner
} from "react-icons/fa";

export default function Dashboard() {
    const [collapsed, setCollapsed] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUserRole(parsed.role);
      } catch {
        setUserRole(null);
      }
    }
  }, []);

  // ============================================
  // UNESWA SMART ATTENDANCE SYSTEM - DUMMY DATA
  // ============================================

  const [stats] = useState({
    totals: {
      students: 2847,
      lecturers: 156,
      departments: 12,
      courses: 48,
      modules: 234,
      activeSessions: 24,
      todayAttendance: 1876,
      averageAttendance: 87
    },
    monthlyNew: {
      students: 145,
      courses: 8,
      modules: 23
    },
    byDepartment: [
      { name: "Faculty of Agriculture", students: 345, lecturers: 18, attendance: 82 },
      { name: "Faculty of Commerce", students: 512, lecturers: 32, attendance: 89 },
      { name: "Faculty of Health Sciences", students: 289, lecturers: 14, attendance: 94 },
      { name: "Faculty of Humanities", students: 667, lecturers: 42, attendance: 76 },
      { name: "Faculty of Science", students: 498, lecturers: 28, attendance: 88 },
      { name: "Faculty of Education", students: 536, lecturers: 22, attendance: 85 }
    ],
    monthlyTrend: [
      { month: "Jan", students: 2450, attendance: 78, sessions: 18 },
      { month: "Feb", students: 2520, attendance: 82, sessions: 22 },
      { month: "Mar", students: 2610, attendance: 85, sessions: 24 },
      { month: "Apr", students: 2680, attendance: 83, sessions: 20 },
      { month: "May", students: 2760, attendance: 87, sessions: 26 },
      { month: "Jun", students: 2847, attendance: 89, sessions: 24 }
    ],
    genderStats: {
      students: { male: 1520, female: 1327 },
      lecturers: { male: 89, female: 67 }
    },
    topModules: [
      { name: "Advanced Agriculture", code: "AGR301", attendance: 94, students: 45, lecturer: "Dr. Thabo Dlamini" },
      { name: "Financial Accounting", code: "ACC201", attendance: 91, students: 52, lecturer: "Prof. Nomsa Mamba" },
      { name: "Organic Chemistry", code: "CHE301", attendance: 88, students: 38, lecturer: "Dr. Sipho Nkosi" },
      { name: "African Literature", code: "LIT201", attendance: 86, students: 41, lecturer: "Prof. Gugu Simelane" },
      { name: "Public Health", code: "HLT101", attendance: 93, students: 35, lecturer: "Dr. Mandla Kunene" }
    ],
    recentActivity: [
      { id: 1, type: "attendance", title: "QR Session Completed", description: "AGR301 - 42/45 students marked present", time: "2 minutes ago", icon: "✅", status: "success" },
      { id: 2, type: "module", title: "New Module Created", description: "Database Systems (CSC301) added to BSC", time: "1 hour ago", icon: "📚", status: "info" },
      { id: 3, type: "student", title: "Student Enrollment", description: "45 new students enrolled in BCOM", time: "3 hours ago", icon: "👨‍🎓", status: "success" },
      { id: 4, type: "qr", title: "QR Code Generated", description: "New session QR for CHE301 lecture", time: "5 hours ago", icon: "📱", status: "info" },
      { id: 5, type: "lecturer", title: "Lecturer Assigned", description: "Dr. Sipho Nkosi assigned to PHY201", time: "1 day ago", icon: "👩‍🏫", status: "info" },
      { id: 6, type: "report", title: "Attendance Report", description: "Weekly attendance report generated", time: "2 days ago", icon: "📊", status: "success" }
    ],
    upcomingSessions: [
      { id: 1, module: "Advanced Agriculture", code: "AGR301", time: "09:00 AM", venue: "Agriculture Hall", qrActive: true },
      { id: 2, module: "Financial Accounting", code: "ACC201", time: "11:00 AM", venue: "Commerce Block", qrActive: true },
      { id: 3, module: "Organic Chemistry", code: "CHE301", time: "02:00 PM", venue: "Science Lab", qrActive: false }
    ]
  });

  const getAttendanceColor = (attendance: number) => {
    if (attendance >= 90) return "#2ecc71";
    if (attendance >= 80) return "#ffb81c";
    if (attendance >= 70) return "#e67e22";
    return "#c8102e";
  };

  return (
    <div className={styles.dashboardWrapper}>
    <SideNav collapsed={collapsed} setCollapsed={setCollapsed} />
      
      <main className={`${styles.dashboardMain} ${collapsed ? styles.mainCollapsed : styles.mainExpanded}`}>
        {/* Header */}
        <header className={styles.dashboardHeader}>
          <div className={styles.headerLeft}>
            <h1 className={styles.dashboardTitle}>SMMS Dashboard</h1>
            <p className={styles.dashboardSubtitle}>
              Smart Attendance Management System - Dashboard
            </p>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.searchBar}>
              <FaSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search students, courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>
          
         
            <div className={styles.dateDisplay}>
              <FaClock className={styles.dateIcon} />
              <span>
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <section className={styles.statsSection}>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ color: "#c8102e" }}>
                <FaUsers />
              </div>
              <div className={styles.statContent}>
                <p className={styles.statValue}>{stats.totals.students.toLocaleString()}</p>
                <p className={styles.statTitle}>Total Students</p>
                <span className={styles.statChange}>↑ 12% this year</span>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ color: "#ffb81c" }}>
                <FaChalkboardTeacher />
              </div>
              <div className={styles.statContent}>
                <p className={styles.statValue}>{stats.totals.lecturers}</p>
                <p className={styles.statTitle}>Active Lecturers</p>
                <span className={styles.statChange}>↑ 5 new this month</span>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ color: "#4a9eff" }}>
                <FaUniversity />
              </div>
              <div className={styles.statContent}>
                <p className={styles.statValue}>{stats.totals.departments}</p>
                <p className={styles.statTitle}>Faculties</p>
                <span className={styles.statChange}>6 Academic Faculties</span>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ color: "#2ecc71" }}>
                <FaCalendarCheck />
              </div>
              <div className={styles.statContent}>
                <p className={styles.statValue}>{stats.totals.todayAttendance.toLocaleString()}</p>
                <p className={styles.statTitle}>Today's Attendance</p>
                <span className={styles.statChange}>{stats.totals.averageAttendance}% average</span>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ color: "#9b59b6" }}>
                <FaCube />
              </div>
              <div className={styles.statContent}>
                <p className={styles.statValue}>{stats.totals.modules}</p>
                <p className={styles.statTitle}>Active Modules</p>
                <span className={styles.statChange}>Across {stats.totals.courses} courses</span>
              </div>
            </div>
          </div>
        </section>

        {/* Charts Section */}
        <section className={styles.chartsSection}>
          <div className={styles.chartCard}>
            <h2 className={styles.chartCardTitle}>Recent QR Activity</h2>
            <div className={styles.topModulesList}>
              {stats.topModules.map((module, idx) => (
                <div key={idx} className={styles.topModuleItem}>
                  <div className={styles.topModuleInfo}>
                    <span className={styles.topModuleRank}>{idx + 1}</span>
                    <div>
                      <div className={styles.topModuleName}>{module.name}</div>
                      <div className={styles.topModuleCode}>{module.code}</div>
                    </div>
                  </div>
                  <div className={styles.topModuleAttendance}>
                    <div className={styles.progressBarTrack}>
                      <div 
                        className={styles.progressBarFill}
                        style={{ width: `${module.attendance}%`, backgroundColor: getAttendanceColor(module.attendance) }}
                      />
                    </div>
                    <span className={styles.topModulePercent}>{module.attendance}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Attendance Trend */}
          <div className={styles.chartCard}>
            <h2 className={styles.chartCardTitle}>📈 Monthly Attendance Trend</h2>
            <div className={styles.lineChartContainer}>
              {stats.monthlyTrend.map((month, idx) => {
                const maxAttendance = Math.max(...stats.monthlyTrend.map(m => m.attendance));
                const height = (month.attendance / maxAttendance) * 120;
                return (
                  <div key={idx} className={styles.lineChartBar}>
                    <div className={styles.lineChartValue}>{month.attendance}%</div>
                    <div className={styles.lineChartBarFill} style={{ height: `${height}px`, backgroundColor: getAttendanceColor(month.attendance) }} />
                    <div className={styles.lineChartLabel}>{month.month}</div>
                  </div>
                );
              })}
            </div>
            <div className={styles.chartFooter}>Average attendance rate over 6 months</div>
          </div>
        </section>
      </main>
    </div>
  );
}