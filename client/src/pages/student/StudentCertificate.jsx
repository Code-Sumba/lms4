import { useEffect, useState, useRef } from "react";
import { Award, Loader, Printer, CheckCircle } from "lucide-react";
import useAuthStore from "../../store/authStore";
import api from "../../api/axios";

const LEVEL_LABELS = {
  1:"Mech Tech",2:"Electronics",3:"Electro Mechanical",
  4:"Digi-Coding",5:"Digi-Sense",6:"Wireless & IoT",
};
const LEVEL_COLORS = {
  1:"#f97316",2:"#eab308",3:"#22c55e",
  4:"#3b82f6",5:"#a855f7",6:"#ec4899",
};

function CertificateCard({ cert, studentName }) {
  const printRef = useRef();
  const color    = LEVEL_COLORS[cert.roboticsLevel] || "#6366f1";
  const pct      = Math.round((cert.score / cert.totalMarks) * 100);

  const handlePrint = () => {
    const content = printRef.current.innerHTML;
    const win = window.open("", "_blank");
    win.document.write(`
      <html><head><title>Certificate — ${studentName}</title>
      <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family: Georgia, serif; background: #fff; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
        .cert { width: 800px; border: 12px solid ${color}; padding: 60px; text-align: center; position: relative; }
        .cert-border { position: absolute; inset: 8px; border: 2px solid ${color}44; pointer-events: none; }
        .logo { font-size: 13px; letter-spacing: 4px; text-transform: uppercase; color: #666; margin-bottom: 24px; }
        .title { font-size: 42px; color: #1a1a1a; margin-bottom: 8px; }
        .subtitle { font-size: 14px; letter-spacing: 2px; text-transform: uppercase; color: #888; margin-bottom: 40px; }
        .presented { font-size: 14px; color: #666; margin-bottom: 12px; }
        .name { font-size: 36px; color: ${color}; border-bottom: 2px solid ${color}44; padding-bottom: 12px; margin-bottom: 32px; }
        .achievement { font-size: 14px; color: #666; margin-bottom: 8px; }
        .exam { font-size: 20px; font-weight: bold; color: #1a1a1a; margin-bottom: 8px; }
        .level { font-size: 14px; color: #888; margin-bottom: 32px; }
        .score { display: inline-block; background: ${color}11; border: 1px solid ${color}44; padding: 8px 24px; border-radius: 8px; font-size: 18px; color: ${color}; margin-bottom: 40px; }
        .footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 40px; }
        .date { font-size: 12px; color: #888; }
        .seal { width: 60px; height: 60px; border-radius: 50%; background: ${color}; display: flex; align-items: center; justify-content: center; color: white; font-size: 10px; font-weight: bold; text-align: center; line-height: 1.2; }
      </style></head><body>
      <div class="cert">
        <div class="cert-border"></div>
        <div class="logo">Motion Robotics LMS</div>
        <div class="title">Certificate</div>
        <div class="subtitle">of Achievement</div>
        <div class="presented">This is to certify that</div>
        <div class="name">${studentName}</div>
        <div class="achievement">has successfully completed</div>
        <div class="exam">${cert.examTitle}</div>
        <div class="level">Level ${cert.roboticsLevel} — ${LEVEL_LABELS[cert.roboticsLevel]}</div>
        <div class="score">Score: ${cert.score} / ${cert.totalMarks} (${pct}%)</div>
        <div class="footer">
          <div class="date">Issued: ${new Date(cert.issuedAt).toLocaleDateString("en-IN",{year:"numeric",month:"long",day:"numeric"})}</div>
          <div class="seal">MR<br/>LMS</div>
        </div>
      </div>
      </body></html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 400);
  };

  return (
    <div className="card overflow-hidden">
      {/* Preview */}
      <div ref={printRef} className="hidden">{cert.examTitle}</div>
      <div className="border-l-4 pl-4 mb-4" style={{ borderColor: color }}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-sm font-semibold text-slate-200 mb-1">{cert.examTitle}</div>
            <div className="flex items-center gap-2">
              <span className="badge" style={{ color, borderColor: color+"44", background: color+"11" }}>
                L{cert.roboticsLevel} · {LEVEL_LABELS[cert.roboticsLevel]}
              </span>
              <span className="badge badge-green"><CheckCircle size={11}/> Passed</span>
            </div>
          </div>
          <Award size={24} style={{ color }} className="flex-shrink-0 opacity-70" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: "Score",   val: `${cert.score}/${cert.totalMarks}` },
          { label: "Grade",   val: `${pct}%` },
          { label: "Issued",  val: new Date(cert.issuedAt).toLocaleDateString() },
        ].map((s) => (
          <div key={s.label} className="bg-surface rounded-lg p-2 text-center">
            <div className="text-sm font-semibold text-slate-200">{s.val}</div>
            <div className="text-xs text-slate-600">{s.label}</div>
          </div>
        ))}
      </div>

      <button onClick={handlePrint} className="btn-primary btn-sm w-full gap-2">
        <Printer size={14} /> Print / Download PDF
      </button>
    </div>
  );
}

export default function StudentCertificate() {
  const { user }   = useAuthStore();
  const [certs,    setCerts]   = useState([]);
  const [loading,  setLoading] = useState(true);

  useEffect(() => {
    api.get("/certificates/mine")
      .then(({ data }) => setCerts(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-title">My Certificates</h1>
        <p className="page-sub">Certificates earned by passing exams. Click "Print" to save as PDF.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader size={20} className="animate-spin text-slate-600" />
        </div>
      ) : certs.length === 0 ? (
        <div className="card">
          <div className="empty-state py-12">
            <Award size={28} className="empty-icon" />
            <p className="empty-title">No certificates yet</p>
            <p className="empty-desc">Pass an exam to earn your first certificate.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {certs.map((c) => (
            <CertificateCard key={c._id} cert={c} studentName={user?.fullName || "Student"} />
          ))}
        </div>
      )}
    </div>
  );
}
