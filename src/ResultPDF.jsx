import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import booklist from './booklist.json';

// Configuration for Dashboard Themes
const theme = {
    primary: '#1e3a8a',
    secondary: '#334155',
    accent: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    bg: '#f8fafc',
    white: '#ffffff',
    text: '#1e293b',
    border: '#e2e8f0'
};

const BTEB_REGULATIONS = {
    '2022': [2, 2, 5, 10, 10, 20, 25, 26],
    '2016': [5, 5, 5, 10, 15, 20, 25, 15],
    '2010': [5, 5, 5, 10, 10, 20, 25, 20],
};

const styles = StyleSheet.create({
    // --- Shared Dashboard Components ---
    page: { backgroundColor: theme.bg, fontFamily: 'Helvetica' },
    layout: { flexDirection: 'row', height: '100%' },

    // Sidebar
    sidebar: { width: 180, backgroundColor: theme.primary, color: '#ffffff', padding: 25, height: '100%' },
    sidebarTitle: { fontSize: 13, fontWeight: 'bold', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 },
    sidebarSub: { fontSize: 7, color: '#93c5fd', marginBottom: 25, textTransform: 'uppercase', letterSpacing: 0.5 },
    sidebarCard: { backgroundColor: 'rgba(255, 255, 255, 0.08)', padding: 12, borderRadius: 10, marginBottom: 15, border: '1 solid rgba(255, 255, 255, 0.1)' },
    sidebarLabel: { fontSize: 7, color: '#93c5fd', textTransform: 'uppercase', marginBottom: 3 },
    sidebarValue: { fontSize: 10, fontWeight: 'bold' },
    sidebarInst: { fontSize: 7, color: '#cbd5e1', lineHeight: 1.4, marginTop: 5 },

    // Main Area
    main: { flex: 1, padding: 30 },
    headerTitle: { fontSize: 22, fontWeight: 'black', color: theme.text, marginBottom: 4 },
    headerSub: { fontSize: 9, color: '#64748b', marginBottom: 25 },

    // Summary Metrics
    metricsGrid: { flexDirection: 'row', gap: 12, marginBottom: 20 },
    metricCard: { flex: 1, backgroundColor: theme.white, padding: 12, borderRadius: 12, borderLeftWidth: 3, borderLeftColor: theme.accent, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 3 },
    metricLabel: { fontSize: 7, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 5 },
    metricValue: { fontSize: 20, fontWeight: 'bold', color: theme.text },

    // Referral Notice
    referralBox: { backgroundColor: '#fef2f2', borderLeftWidth: 4, borderLeftColor: theme.danger, padding: 15, borderRadius: 8, marginBottom: 20 },
    referralTitle: { fontSize: 9, fontWeight: 'bold', color: '#991b1b', marginBottom: 6 },
    referralTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
    referralTag: { backgroundColor: theme.white, padding: '3 6', borderRadius: 4, fontSize: 8, fontWeight: 'bold', color: theme.danger, border: '1 solid #fecaca' },

    // Grid Layouts
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    gridCard: { backgroundColor: theme.white, padding: 10, borderRadius: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    gridCard2Col: { width: '48%' },
    gridCard3Col: { width: '31%' },
    gridCard4Col: { width: '23.5%' },

    // Footer
    footer: { marginTop: 'auto', borderTopWidth: 1, borderTopColor: theme.border, paddingTop: 12, textAlign: 'center' },
    footerText: { fontSize: 7, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.5 },
});

const ResultPDF = ({ result, templateType = 'admin_compact', pageSize = 'A4', orientation = 'landscape' }) => {

    const isFailed = result.status === 'failed';
    const admissionYear = result.admission?.split('-')[1] || '2022';
    const weights = BTEB_REGULATIONS[admissionYear] || BTEB_REGULATIONS['2022'];

    const getSubjectName = (code) => {
        const cleanCode = code.split('(')[0].trim();
        const book = booklist.find(b => b.code === cleanCode);
        return book ? book.bookname : `Subject ${code}`;
    };

    const calculateResultCGPA = () => {
        if (!result.data.semesters) return '0.00';
        let totalWeighted = 0;
        let usedWeight = 0;

        result.data.semesters.forEach((sem, i) => {
            const val = parseFloat(sem.value);
            if (!isNaN(val) && sem.status === 'passed') {
                totalWeighted += val * (weights[i] / 100);
                usedWeight += weights[i];
            }
        });

        if (usedWeight === 0) return '0.00';
        return (totalWeighted / (usedWeight / 100)).toFixed(2);
    };

    const dashboardCgpa = calculateResultCGPA();

    // Sidebar Content Component
    const Sidebar = () => (
        <View style={styles.sidebar}>
            <View>
                <Text style={styles.sidebarTitle}>BTEB PORTAL</Text>
                <Text style={styles.sidebarSub}>Digital Transcript Access</Text>
            </View>

            <View style={{ marginTop: 15 }}>
                <View style={styles.sidebarCard}>
                    <Text style={styles.sidebarLabel}>Registered Roll</Text>
                    <Text style={styles.sidebarValue}>{result.roll}</Text>
                </View>

                <View style={styles.sidebarCard}>
                    <Text style={styles.sidebarLabel}>Candidate Profile</Text>
                    <Text style={[styles.sidebarValue, { fontSize: 8 }]}>{result.admission || 'Diploma Scholar'}</Text>
                </View>

                <View style={styles.sidebarCard}>
                    <Text style={styles.sidebarLabel}>Education Institution</Text>
                    <Text style={styles.sidebarValue}>{result.institute ? result.institute.split(' ')[0] : 'N/A'}</Text>
                    <Text style={styles.sidebarInst}>{result.institute ? result.institute.replace(/^\d+\s+-\s+/, '') : 'Unknown Center'}</Text>
                </View>
            </View>

            <View style={{ marginTop: 'auto' }}>
                <Text style={styles.sidebarLabel}>System Verification</Text>
                <Text style={{ fontSize: 7, color: '#94a3b8' }}>ID: {result.roll}-{Math.random().toString(36).substr(2, 5).toUpperCase()}</Text>
            </View>
        </View>
    );

    const ReferralNotice = () => (
        result.data.failed_subjects && result.data.failed_subjects.length > 0 ? (
            <View style={styles.referralBox}>
                <Text style={styles.referralTitle}>ACTIVE PERFORMANCE RECTIFICATION NOTICE</Text>
                <View style={styles.referralTags}>
                    {result.data.failed_subjects.map((sub, i) => (
                        <View key={i} style={styles.referralTag}>
                            <Text style={{ fontSize: 7 }}>{sub} • {getSubjectName(sub)}</Text>
                        </View>
                    ))}
                </View>
            </View>
        ) : null
    );

    // --- TEMPLATE 1: ADMIN COMPACT (Landscape Optimized Sidebar) ---
    const renderAdminCompact = () => (
        <Page size={pageSize} orientation={orientation} style={styles.page}>
            <View style={styles.layout}>
                <Sidebar />
                <View style={styles.main}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <View>
                            <Text style={styles.headerTitle}>Academic Dashboard</Text>
                            <Text style={styles.headerSub}>Real-time performance metrics and curriculum tracking.</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={styles.sidebarLabel}>Issue Timestamp</Text>
                            <Text style={{ fontSize: 7, color: theme.secondary }}>{new Date().toLocaleDateString('en-GB')}</Text>
                        </View>
                    </View>

                    <View style={styles.metricsGrid}>
                        <View style={styles.metricCard}>
                            <Text style={styles.metricLabel}>Standing CGPA</Text>
                            <Text style={[styles.metricValue, { color: theme.primary }]}>{dashboardCgpa}</Text>
                        </View>
                        <View style={[styles.metricCard, { borderLeftColor: isFailed ? theme.danger : theme.success }]}>
                            <Text style={styles.metricLabel}>Academic Status</Text>
                            <Text style={[styles.metricValue, { fontSize: 16, color: isFailed ? theme.danger : theme.success }]}>{result.status.toUpperCase()}</Text>
                        </View>
                        <View style={styles.metricCard}>
                            <Text style={styles.metricLabel}>Credits Earned</Text>
                            <Text style={styles.metricValue}>128/160</Text>
                        </View>
                    </View>

                    <ReferralNotice />

                    <View>
                        <Text style={[styles.sidebarLabel, { marginBottom: 10, color: '#64748b' }]}>Semester Timeline Breakdown</Text>
                        <View style={styles.grid}>
                            {result.data.semesters?.map((sem, i) => (
                                <View key={i} style={[styles.gridCard, orientation === 'landscape' ? styles.gridCard4Col : styles.gridCard2Col]}>
                                    <Text style={styles.sidebarLabel}>{sem.label}</Text>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: sem.status === 'passed' ? theme.accent : theme.danger }}>
                                            {sem.status === 'referred' ? 'FAIL' : sem.value}
                                        </Text>
                                        <Text style={{ fontSize: 6, color: '#94a3b8' }}>Trend: {parseFloat(sem.value) > 3.5 ? 'Peak' : 'Stable'}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Secure Digital Record Repository • End of Statement</Text>
                    </View>
                </View>
            </View>
        </Page>
    );

    // --- TEMPLATE 2: ADMIN DETAILED (Detailed Card Grid) ---
    const renderAdminDetailed = () => (
        <Page size={pageSize} orientation={orientation} style={styles.page}>
            <View style={{ padding: 40 }}>
                <View style={{ borderBottomWidth: 2, borderBottomColor: theme.primary, paddingBottom: 15, marginBottom: 25, flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View>
                        <Text style={{ fontSize: 28, fontWeight: 'black', color: theme.primary }}>Academic History Report</Text>
                        <Text style={{ fontSize: 10, color: theme.secondary, marginTop: 4 }}>Curriculum: {admissionYear} Bangladesh Diploma in Engineering (BTEB)</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.sidebarLabel}>Record Owner</Text>
                        <Text style={{ fontSize: 14, fontWeight: 'bold' }}>Roll: {result.roll}</Text>
                    </View>
                </View>

                <View style={styles.metricsGrid}>
                    <View style={styles.metricCard}>
                        <Text style={styles.metricLabel}>Weighted Cumulative GPA</Text>
                        <Text style={styles.metricValue}>{dashboardCgpa}</Text>
                    </View>
                    <View style={styles.metricCard}>
                        <Text style={styles.metricLabel}>Final Institute Assessment</Text>
                        <Text style={{ fontSize: 11, fontWeight: 'medium', marginTop: 10 }}>{result.institute?.replace(/^\d+\s+-\s+/, '')}</Text>
                    </View>
                </View>

                <ReferralNotice />

                <View style={styles.grid}>
                    {result.data.semesters?.map((sem, i) => (
                        <View key={i} style={[styles.gridCard, { width: '31%', padding: 15, borderLeftWidth: 4, borderLeftColor: sem.status === 'passed' ? theme.success : theme.danger }]}>
                            <Text style={styles.sidebarLabel}>Semester Cycle {i + 1}</Text>
                            <Text style={{ fontSize: 12, fontWeight: 'bold', marginTop: 5 }}>{sem.label}</Text>
                            <View style={{ marginTop: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text style={{ fontSize: 10, fontWeight: 'bold', color: sem.status === 'passed' ? theme.success : theme.danger }}>{sem.value}</Text>
                                <Text style={{ fontSize: 7, color: '#94a3b8' }}>Weight: {weights[i]}%</Text>
                            </View>
                        </View>
                    ))}
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Certified Digital Release • Verify at BTEB Results Portal</Text>
                </View>
            </View>
        </Page>
    );

    // --- TEMPLATE 3: ADMIN SUMMARY (Large Metrics & Simple List) ---
    const renderAdminSummary = () => (
        <Page size={pageSize} orientation={orientation} style={styles.page}>
            <View style={{ padding: 50, textAlign: 'center' }}>
                <Text style={{ fontSize: 36, fontWeight: 'black', color: theme.primary, marginBottom: 10 }}>CERTIFIED PERFORMANCE SUMMARY</Text>
                <Text style={{ fontSize: 12, color: theme.secondary, marginBottom: 40 }}>OFFICIAL ACADEMIC STANDING FOR ROLL {result.roll}</Text>

                <View style={{ flexDirection: 'row', gap: 20, justifyContent: 'center', marginBottom: 50 }}>
                    <View style={{ backgroundColor: theme.primary, padding: 30, borderRadius: 20, width: 220 }}>
                        <Text style={{ fontSize: 12, color: '#93c5fd', marginBottom: 10, textTransform: 'uppercase' }}>Weighted CGPA</Text>
                        <Text style={{ fontSize: 48, fontWeight: 'black', color: '#fff' }}>{dashboardCgpa}</Text>
                    </View>
                    <View style={{ backgroundColor: theme.white, padding: 30, borderRadius: 20, width: 220, borderTopWidth: 8, borderTopColor: isFailed ? theme.danger : theme.success }}>
                        <Text style={{ fontSize: 12, color: '#94a3b8', marginBottom: 10, textTransform: 'uppercase' }}>Academic Status</Text>
                        <Text style={{ fontSize: 24, fontWeight: 'black', color: isFailed ? theme.danger : theme.success }}>{result.status.toUpperCase()}</Text>
                    </View>
                </View>

                <ReferralNotice />

                <View style={{ marginTop: 20, textAlign: 'left' }}>
                    <Text style={[styles.sidebarLabel, { marginBottom: 15 }]}>Semester Breakdown Summary</Text>
                    <View style={{ backgroundColor: '#fff', borderRadius: 15 }}>
                        {result.data.semesters?.map((sem, i) => (
                            <View key={i} style={{ flexDirection: 'row', padding: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
                                <Text style={{ fontSize: 10, fontWeight: 'bold', flex: 1 }}>{sem.label}</Text>
                                <Text style={{ fontSize: 10, fontWeight: 'bold', flex: 1, textAlign: 'right', color: sem.status === 'passed' ? theme.accent : theme.danger }}>{sem.value}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                <View style={{ marginTop: 'auto', paddingTop: 30 }}>
                    <Text style={{ fontSize: 8, fontStyle: 'italic', color: '#94a3b8' }}>This document is a performance summary generated via the BTEB Academic Portal. For a full credit transcript, select the "Detailed" configuration.</Text>
                </View>
            </View>
        </Page>
    );

    const getTemplate = () => {
        switch (templateType) {
            case 'admin_detailed': return renderAdminDetailed();
            case 'admin_summary': return renderAdminSummary();
            default: return renderAdminCompact();
        }
    };

    return (
        <Document>
            {getTemplate()}
        </Document>
    );
};

export default ResultPDF;
