import { useState, useEffect, useRef } from "react";

// ─── Fonts via Google (injected once) ───────────────────────────────────────
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href =
  "https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap";
document.head.appendChild(fontLink);

// ─── Global styles ───────────────────────────────────────────────────────────
const globalCSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #060810;
    --surface: #0d1117;
    --border: rgba(0,200,255,0.12);
    --accent: #00c8ff;
    --accent2: #7b5ea7;
    --text: #e8edf5;
    --muted: #6b7a99;
    --glow: 0 0 40px rgba(0,200,255,0.18);
    --font-display: 'Syne', sans-serif;
    --font-mono: 'Space Mono', monospace;
  }
  html { scroll-behavior: smooth; }
  body {
    background: var(--bg);
    color: var(--text);
    font-family: var(--font-display);
    overflow-x: hidden;
    cursor: none;
  }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: var(--accent); border-radius: 2px; }

  @keyframes fadeUp {
    from { opacity:0; transform:translateY(32px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
  @keyframes float {
    0%,100%{transform:translateY(0px)} 50%{transform:translateY(-12px)}
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes pulse-ring {
    0%   { transform:scale(1);   opacity:.6; }
    100% { transform:scale(1.8); opacity:0; }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  @keyframes scanline {
    0%   { top:-10%; }
    100% { top:110%; }
  }
  .fade-up   { animation: fadeUp .7s ease forwards; }
  .delay-1   { animation-delay:.1s; opacity:0; }
  .delay-2   { animation-delay:.25s; opacity:0; }
  .delay-3   { animation-delay:.4s; opacity:0; }
  .delay-4   { animation-delay:.55s; opacity:0; }
  .delay-5   { animation-delay:.7s; opacity:0; }

  .section-reveal {
    opacity: 0;
    transform: translateY(40px);
    transition: opacity .8s ease, transform .8s ease;
  }
  .section-reveal.visible {
    opacity: 1;
    transform: translateY(0);
  }

  nav a, .skill-tag, .btn { cursor: none; }
`;
const styleEl = document.createElement("style");
styleEl.textContent = globalCSS;
document.head.appendChild(styleEl);

// ─── Cursor ──────────────────────────────────────────────────────────────────
function Cursor() {
  const dot = useRef(null);
  const ring = useRef(null);
  const pos = useRef({ x: 0, y: 0 });
  const ringPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const move = (e) => {
      pos.current = { x: e.clientX, y: e.clientY };
      if (dot.current) {
        dot.current.style.left = e.clientX + "px";
        dot.current.style.top = e.clientY + "px";
      }
    };
    window.addEventListener("mousemove", move);
    let raf;
    const lerp = (a, b, t) => a + (b - a) * t;
    const tick = () => {
      ringPos.current.x = lerp(ringPos.current.x, pos.current.x, 0.12);
      ringPos.current.y = lerp(ringPos.current.y, pos.current.y, 0.12);
      if (ring.current) {
        ring.current.style.left = ringPos.current.x + "px";
        ring.current.style.top = ringPos.current.y + "px";
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { window.removeEventListener("mousemove", move); cancelAnimationFrame(raf); };
  }, []);

  return (
    <>
      <div ref={dot} style={{
        position:"fixed", pointerEvents:"none", zIndex:9999,
        width:8, height:8, borderRadius:"50%", background:"var(--accent)",
        transform:"translate(-50%,-50%)", transition:"width .2s,height .2s",
        boxShadow:"0 0 12px var(--accent)",
      }}/>
      <div ref={ring} style={{
        position:"fixed", pointerEvents:"none", zIndex:9998,
        width:36, height:36, borderRadius:"50%",
        border:"1.5px solid rgba(0,200,255,0.5)",
        transform:"translate(-50%,-50%)",
      }}/>
    </>
  );
}

// ─── Particle canvas ─────────────────────────────────────────────────────────
function Particles() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);
    const count = 90;
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35,
      r: Math.random() * 1.5 + .5,
      a: Math.random() * .6 + .1,
    }));
    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,200,255,${p.a})`;
        ctx.fill();
      });
      // lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 110) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0,200,255,${(1 - d / 110) * 0.12})`;
            ctx.lineWidth = .6;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { window.removeEventListener("resize", resize); cancelAnimationFrame(raf); };
  }, []);
  return <canvas ref={canvasRef} style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none" }} />;
}

// ─── Typewriter ───────────────────────────────────────────────────────────────
function Typewriter({ words }) {
  const [idx, setIdx] = useState(0);
  const [txt, setTxt] = useState("");
  const [del, setDel] = useState(false);
  useEffect(() => {
    const current = words[idx];
    const timeout = setTimeout(() => {
      if (!del) {
        if (txt.length < current.length) setTxt(current.slice(0, txt.length + 1));
        else setTimeout(() => setDel(true), 1200);
      } else {
        if (txt.length > 0) setTxt(txt.slice(0, -1));
        else { setDel(false); setIdx((idx + 1) % words.length); }
      }
    }, del ? 55 : 90);
    return () => clearTimeout(timeout);
  }, [txt, del, idx, words]);
  return (
    <span style={{ color:"var(--accent)", fontFamily:"var(--font-mono)" }}>
      {txt}<span style={{ animation:"blink 1s infinite" }}>_</span>
    </span>
  );
}

// ─── Section wrapper with scroll reveal ──────────────────────────────────────
function Reveal({ children, style }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.classList.add("visible"); obs.disconnect(); }
    }, { threshold: 0.12 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return <div ref={ref} className="section-reveal" style={style}>{children}</div>;
}

// ─── Nav ──────────────────────────────────────────────────────────────────────
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const links = ["About","Skills","Experience","Education","Project","Contact"];
  return (
    <nav style={{
      position:"fixed", top:0, left:0, right:0, zIndex:100,
      display:"flex", justifyContent:"space-between", alignItems:"center",
      padding:"18px 48px",
      background: scrolled ? "rgba(6,8,16,0.92)" : "transparent",
      backdropFilter: scrolled ? "blur(16px)" : "none",
      borderBottom: scrolled ? "1px solid var(--border)" : "none",
      transition:"all .4s ease",
    }}>
      <div style={{ fontFamily:"var(--font-mono)", color:"var(--accent)", fontSize:18, fontWeight:700, letterSpacing:2 }}>
        SS<span style={{ color:"var(--text)" }}>.</span>
      </div>
      <div style={{ display:"flex", gap:32 }}>
        {links.map(l => (
          <a key={l} href={`#${l.toLowerCase()}`} style={{
            color:"var(--muted)", textDecoration:"none", fontSize:13,
            letterSpacing:1.5, textTransform:"uppercase",
            transition:"color .2s",
            fontFamily:"var(--font-mono)",
          }}
          onMouseEnter={e=>e.target.style.color="var(--accent)"}
          onMouseLeave={e=>e.target.style.color="var(--muted)"}
          >{l}</a>
        ))}
      </div>
    </nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section id="about" style={{
      minHeight:"100vh", display:"flex", alignItems:"center",
      padding:"120px 10vw 80px", position:"relative", zIndex:1,
    }}>
      {/* decorative ring */}
      <div style={{
        position:"absolute", right:"8vw", top:"50%", transform:"translateY(-50%)",
        width:340, height:340, borderRadius:"50%",
        border:"1px solid rgba(0,200,255,0.08)",
        boxShadow:"0 0 80px rgba(0,200,255,0.06)",
        animation:"float 6s ease-in-out infinite",
        display:"flex", alignItems:"center", justifyContent:"center",
      }}>
        <div style={{
          width:260, height:260, borderRadius:"50%",
          border:"1px solid rgba(0,200,255,0.12)",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:90,
        }}>⚡</div>
      </div>

      <div>
        <p className="fade-up delay-1" style={{ fontFamily:"var(--font-mono)", color:"var(--accent)", fontSize:13, letterSpacing:3, marginBottom:16, textTransform:"uppercase" }}>
          — Hello, World
        </p>
        <h1 className="fade-up delay-2" style={{ fontSize:"clamp(48px,8vw,88px)", fontWeight:800, lineHeight:1.05, marginBottom:12 }}>
          Sunit<br/>Sarkar
        </h1>
        <h2 className="fade-up delay-3" style={{ fontSize:"clamp(18px,3vw,28px)", fontWeight:400, color:"var(--muted)", marginBottom:24 }}>
          <Typewriter words={["Electrical Engineer","MATLAB & Simulink","Control Systems","Python Developer","Problem Solver"]} />
        </h2>
        <p className="fade-up delay-4" style={{ maxWidth:520, lineHeight:1.8, color:"#8a9ab5", fontSize:15, marginBottom:40 }}>
          Aspiring Electrical Engineer with a strong foundation in control systems, circuit design, and MATLAB/Simulink. B.Tech from Ramkrishna Mahato Government Engineering College (CGPA 8.39). Passionate about intelligent systems and optimization techniques.
        </p>
        <div className="fade-up delay-5" style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
          <a href="#project" style={{
            padding:"14px 32px", background:"var(--accent)", color:"#000",
            borderRadius:3, fontWeight:700, fontSize:13, letterSpacing:1.5,
            textDecoration:"none", textTransform:"uppercase",
            transition:"box-shadow .3s, transform .2s",
            fontFamily:"var(--font-mono)",
          }}
          onMouseEnter={e=>{e.target.style.boxShadow="0 0 28px rgba(0,200,255,0.5)";e.target.style.transform="translateY(-2px)"}}
          onMouseLeave={e=>{e.target.style.boxShadow="none";e.target.style.transform="translateY(0)"}}
          >View Project</a>
          <a href="#contact" style={{
            padding:"14px 32px", background:"transparent", color:"var(--accent)",
            borderRadius:3, fontWeight:700, fontSize:13, letterSpacing:1.5,
            textDecoration:"none", textTransform:"uppercase",
            border:"1px solid rgba(0,200,255,0.4)",
            transition:"background .3s, transform .2s",
            fontFamily:"var(--font-mono)",
          }}
          onMouseEnter={e=>{e.target.style.background="rgba(0,200,255,0.08)";e.target.style.transform="translateY(-2px)"}}
          onMouseLeave={e=>{e.target.style.background="transparent";e.target.style.transform="translateY(0)"}}
          >Contact Me</a>
        </div>
        {/* Social links */}
        <div className="fade-up delay-5" style={{ display:"flex", gap:20, marginTop:32, alignItems:"center" }}>
          {[
            { label:"GitHub", href:"https://github.com/sunitsarkar" },
            { label:"LinkedIn", href:"https://linkedin.com/in/sunitskr" },
            { label:"Email", href:"mailto:sunit6503@gmail.com" },
          ].map(s => (
            <a key={s.label} href={s.href} target="_blank" rel="noreferrer" style={{
              color:"var(--muted)", fontSize:12, letterSpacing:1.5, textDecoration:"none",
              fontFamily:"var(--font-mono)", textTransform:"uppercase",
              transition:"color .2s",
            }}
            onMouseEnter={e=>e.target.style.color="var(--accent)"}
            onMouseLeave={e=>e.target.style.color="var(--muted)"}
            >{s.label}</a>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Skills ───────────────────────────────────────────────────────────────────
const SKILLS = [
  { cat:"Engineering", items:["Circuit Design & Analysis","Electrical Machines","Control Systems","Wiring","Heat Engines & Turbines"] },
  { cat:"Software & Tools", items:["MATLAB","Simulink","Python","JavaScript","MS Excel","MS Word"] },
  { cat:"Soft Skills", items:["Team Collaboration","Communication","Problem Solving","Troubleshooting"] },
  { cat:"Languages", items:["English (Professional)","Hindi (Professional)","Bengali (Native)"] },
];

function Skills() {
  return (
    <section id="skills" style={{ padding:"100px 10vw", position:"relative", zIndex:1 }}>
      <Reveal>
        <p style={{ fontFamily:"var(--font-mono)", color:"var(--accent)", fontSize:12, letterSpacing:3, marginBottom:8, textTransform:"uppercase" }}>What I Know</p>
        <h2 style={{ fontSize:"clamp(32px,5vw,56px)", fontWeight:800, marginBottom:60 }}>
          Skills & <span style={{
            background:"linear-gradient(90deg,var(--accent),var(--accent2))",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
          }}>Expertise</span>
        </h2>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:24 }}>
          {SKILLS.map(({ cat, items }) => (
            <div key={cat} style={{
              background:"var(--surface)", border:"1px solid var(--border)",
              borderRadius:8, padding:28,
              transition:"border-color .3s, box-shadow .3s",
            }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(0,200,255,0.4)";e.currentTarget.style.boxShadow="var(--glow)"}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.boxShadow="none"}}
            >
              <p style={{ fontFamily:"var(--font-mono)", color:"var(--accent)", fontSize:11, letterSpacing:2, marginBottom:16, textTransform:"uppercase" }}>{cat}</p>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                {items.map(skill => (
                  <span key={skill} className="skill-tag" style={{
                    padding:"6px 14px",
                    background:"rgba(0,200,255,0.06)",
                    border:"1px solid rgba(0,200,255,0.15)",
                    borderRadius:3, fontSize:12, color:"var(--text)",
                    fontFamily:"var(--font-mono)",
                    transition:"background .2s, color .2s",
                  }}
                  onMouseEnter={e=>{e.target.style.background="rgba(0,200,255,0.15)";e.target.style.color="var(--accent)"}}
                  onMouseLeave={e=>{e.target.style.background="rgba(0,200,255,0.06)";e.target.style.color="var(--text)"}}
                  >{skill}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

// ─── Experience ───────────────────────────────────────────────────────────────
function Experience() {
  return (
    <section id="experience" style={{ padding:"100px 10vw", position:"relative", zIndex:1 }}>
      <Reveal>
        <p style={{ fontFamily:"var(--font-mono)", color:"var(--accent)", fontSize:12, letterSpacing:3, marginBottom:8, textTransform:"uppercase" }}>Career</p>
        <h2 style={{ fontSize:"clamp(32px,5vw,56px)", fontWeight:800, marginBottom:60 }}>
          Work <span style={{
            background:"linear-gradient(90deg,var(--accent),var(--accent2))",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
          }}>Experience</span>
        </h2>
        <div style={{
          position:"relative", paddingLeft:40,
          borderLeft:"1px solid var(--border)",
        }}>
          {/* timeline dot */}
          <div style={{
            position:"absolute", left:-7, top:6,
            width:13, height:13, borderRadius:"50%",
            background:"var(--accent)", boxShadow:"0 0 16px var(--accent)",
          }}/>
          <div style={{ position:"absolute", left:-7, top:6, width:13, height:13, borderRadius:"50%", border:"2px solid var(--accent)", animation:"pulse-ring 2s ease-out infinite" }}/>

          <div style={{
            background:"var(--surface)", border:"1px solid var(--border)",
            borderRadius:8, padding:32, maxWidth:620,
            transition:"border-color .3s",
          }}
          onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(0,200,255,0.35)"}
          onMouseLeave={e=>e.currentTarget.style.borderColor="var(--border)"}
          >
            <div style={{ display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:8, marginBottom:12 }}>
              <h3 style={{ fontSize:20, fontWeight:700 }}>INDIAN RAILWAY</h3>
              <span style={{ fontFamily:"var(--font-mono)", color:"var(--accent)", fontSize:12 }}>2026 – Present</span>
            </div>
            <p style={{ color:"var(--accent)", fontFamily:"var(--font-mono)", fontSize:13, marginBottom:16 }}>Assistant LOCO Pilot</p>

            
          </div>
////
          <div style={{
            background:"var(--surface)", border:"1px solid var(--border)",
            borderRadius:8, padding:32, maxWidth:620,
            transition:"border-color .3s",
          }}
          onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(0,200,255,0.35)"}
          onMouseLeave={e=>e.currentTarget.style.borderColor="var(--border)"}
          >
            <div style={{ display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:8, marginBottom:12 }}>
              <h3 style={{ fontSize:20, fontWeight:700 }}>Freelancer</h3>
              <span style={{ fontFamily:"var(--font-mono)", color:"var(--accent)", fontSize:12 }}>March 2023 – Present</span>
            </div>
            <p style={{ color:"var(--accent)", fontFamily:"var(--font-mono)", fontSize:13, marginBottom:16 }}>Software Developer</p>

            
          </div>
////
          <div style={{
            background:"var(--surface)", border:"1px solid var(--border)",
            borderRadius:8, padding:32, maxWidth:620,
            transition:"border-color .3s",
          }}
          onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(0,200,255,0.35)"}
          onMouseLeave={e=>e.currentTarget.style.borderColor="var(--border)"}
          >
            <div style={{ display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:8, marginBottom:12 }}>
              <h3 style={{ fontSize:20, fontWeight:700 }}>10x Academy</h3>
              <span style={{ fontFamily:"var(--font-mono)", color:"var(--accent)", fontSize:12 }}>Aug 2022 – march 2023</span>
            </div>
            <p style={{ color:"var(--accent)", fontFamily:"var(--font-mono)", fontSize:13, marginBottom:16 }}>Software developer Apprentice</p>

            
          </div>

        </div>
      </Reveal>


      
    </section>
  );
}

// ─── Education ────────────────────────────────────────────────────────────────
const EDU = [
  { degree:"B.Tech — Electrical Engineering", inst:"Ramkrishna Mahato Govt. Engineering College, Purulia", year:"2018 – 2022", grade:"CGPA 8.39 / 10", highlight:true },
  { degree:"Higher Secondary (WBCHSE)", inst:"Bethuadahari JCM High School", year:"2017", grade:"66%", highlight:false },
  { degree:"Secondary (WBBSE)", inst:"Sapjola Deshbandhu High School", year:"2015", grade:"78%", highlight:false },
];

function Education() {
  return (
    <section id="education" style={{ padding:"100px 10vw", position:"relative", zIndex:1 }}>
      <Reveal>
        <p style={{ fontFamily:"var(--font-mono)", color:"var(--accent)", fontSize:12, letterSpacing:3, marginBottom:8, textTransform:"uppercase" }}>Academics</p>
        <h2 style={{ fontSize:"clamp(32px,5vw,56px)", fontWeight:800, marginBottom:60 }}>
          Education
        </h2>
        <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
          {EDU.map((e, i) => (
            <div key={i} style={{
              background:"var(--surface)", border:`1px solid ${e.highlight ? "rgba(0,200,255,0.3)" : "var(--border)"}`,
              borderRadius:8, padding:"28px 32px",
              display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:16,
              boxShadow: e.highlight ? "var(--glow)" : "none",
              transition:"transform .3s",
            }}
            onMouseEnter={e2=>e2.currentTarget.style.transform="translateX(8px)"}
            onMouseLeave={e2=>e2.currentTarget.style.transform="translateX(0)"}
            >
              <div>
                <h3 style={{ fontSize:18, fontWeight:700, marginBottom:6 }}>{e.degree}</h3>
                <p style={{ color:"var(--muted)", fontSize:14, fontFamily:"var(--font-mono)" }}>{e.inst}</p>
              </div>
              <div style={{ textAlign:"right" }}>
                <p style={{ fontFamily:"var(--font-mono)", color:"var(--accent)", fontSize:13, marginBottom:4 }}>{e.grade}</p>
                <p style={{ color:"var(--muted)", fontSize:12, fontFamily:"var(--font-mono)" }}>{e.year}</p>
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

// ─── Project ──────────────────────────────────────────────────────────────────
function Project() {
  return (
    <section id="project" style={{ padding:"100px 10vw", position:"relative", zIndex:1 }}>
      <Reveal>
        <p style={{ fontFamily:"var(--font-mono)", color:"var(--accent)", fontSize:12, letterSpacing:3, marginBottom:8, textTransform:"uppercase" }}>Final Year</p>
        <h2 style={{ fontSize:"clamp(32px,5vw,56px)", fontWeight:800, marginBottom:60 }}>
          Featured <span style={{
            background:"linear-gradient(90deg,var(--accent),var(--accent2))",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
          }}>Project</span>
        </h2>
        <div style={{
          background:"var(--surface)", border:"1px solid var(--border)",
          borderRadius:12, overflow:"hidden",
          transition:"border-color .3s, box-shadow .3s",
        }}
        onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(0,200,255,0.4)";e.currentTarget.style.boxShadow="var(--glow)"}}
        onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.boxShadow="none"}}
        >
          {/* top bar */}
          <div style={{
            padding:"16px 24px",
            background:"rgba(0,200,255,0.05)",
            borderBottom:"1px solid var(--border)",
            display:"flex", gap:8, alignItems:"center",
          }}>
            {["#ff5f57","#ffbd2e","#28c840"].map(c => (
              <div key={c} style={{ width:12, height:12, borderRadius:"50%", background:c }}/>
            ))}
            <span style={{ marginLeft:12, fontFamily:"var(--font-mono)", color:"var(--muted)", fontSize:12 }}>
              dc_motor_pso.m
            </span>
          </div>
          <div style={{ padding:"36px 40px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:40 }}>
            <div>
              <h3 style={{ fontSize:22, fontWeight:800, lineHeight:1.3, marginBottom:20 }}>
                System Identification of DC Motor Using Particle Swarm Optimization
              </h3>
              <p style={{ color:"#8a9ab5", lineHeight:1.9, fontSize:14, marginBottom:20 }}>
                Developed a mathematical state-space model of a DC motor and applied the PSO metaheuristic algorithm to identify key motor parameters from measured input-output data — without relying on internal system knowledge.
              </p>
              <p style={{ color:"#8a9ab5", lineHeight:1.9, fontSize:14 }}>
                The project demonstrated the power of bio-inspired optimization in real-world control system modeling, achieving accurate parameter estimation with minimal error.
              </p>
              <div style={{ marginTop:24, display:"flex", gap:10, flexWrap:"wrap" }}>
                {["MATLAB","Simulink","PSO Algorithm","Control Systems","State-Space Modeling"].map(t => (
                  <span key={t} style={{
                    padding:"5px 12px", background:"rgba(0,200,255,0.07)",
                    border:"1px solid rgba(0,200,255,0.2)", borderRadius:3,
                    fontSize:11, fontFamily:"var(--font-mono)", color:"var(--accent)",
                  }}>{t}</span>
                ))}
              </div>
            </div>
            <div style={{
              background:"rgba(0,0,0,0.4)", borderRadius:8,
              padding:24, fontFamily:"var(--font-mono)", fontSize:13, lineHeight:2,
              border:"1px solid var(--border)",
              position:"relative", overflow:"hidden",
            }}>
              <div style={{
                position:"absolute", left:0, right:0, height:2,
                background:"linear-gradient(90deg,transparent,rgba(0,200,255,0.4),transparent)",
                animation:"scanline 3s linear infinite",
              }}/>
              {[
                { c:"#6b7a99", t:"% DC Motor PSO Identification" },
                { c:"#00c8ff", t:"clear; clc; close all;" },
                { c:"#6b7a99", t:"% Define motor state-space model" },
                { c:"#7b5ea7", t:"A = [0 1; -K/J -B/J];" },
                { c:"#7b5ea7", t:"B = [0; Kt/J];" },
                { c:"#6b7a99", t:"% PSO initialization" },
                { c:"#00c8ff", t:"swarm = initParticles(n, bounds);" },
                { c:"#00c8ff", t:"for iter = 1:maxIter" },
                { c:"#7b5ea7", t:"  fitness = evaluate(swarm);" },
                { c:"#7b5ea7", t:"  updateVelocity(swarm);" },
                { c:"#00c8ff", t:"end" },
                { c:"#28c840", t:"% CGPA: 8.39 / 10" },
              ].map((line, i) => (
                <div key={i} style={{ color: line.c }}>{line.t}</div>
              ))}
            </div>
          </div>
          <div style={{
            padding:"20px 40px", borderTop:"1px solid var(--border)",
            display:"flex", gap:32, alignItems:"center",
          }}>
            <div style={{ fontFamily:"var(--font-mono)", fontSize:12 }}>
              <span style={{ color:"var(--muted)" }}>Duration: </span>
              <span style={{ color:"var(--accent)" }}>Mar 2022 – May 2022</span>
            </div>
            <div style={{ fontFamily:"var(--font-mono)", fontSize:12 }}>
              <span style={{ color:"var(--muted)" }}>Type: </span>
              <span style={{ color:"var(--accent)" }}>Final Year Project</span>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

// ─── Contact ──────────────────────────────────────────────────────────────────
function Contact() {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText("sunit6503@gmail.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <section id="contact" style={{ padding:"100px 10vw 120px", position:"relative", zIndex:1 }}>
      <Reveal>
        <p style={{ fontFamily:"var(--font-mono)", color:"var(--accent)", fontSize:12, letterSpacing:3, marginBottom:8, textTransform:"uppercase" }}>Let's Connect</p>
        <h2 style={{ fontSize:"clamp(32px,5vw,56px)", fontWeight:800, marginBottom:24 }}>
          Get In <span style={{
            background:"linear-gradient(90deg,var(--accent),var(--accent2))",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
          }}>Touch</span>
        </h2>
        <p style={{ color:"var(--muted)", maxWidth:480, lineHeight:1.8, marginBottom:48, fontSize:15 }}>
          Open to full-time opportunities, internships, and collaborations in electrical engineering or related technical fields. Let's build something together.
        </p>
        <div style={{ display:"flex", flexWrap:"wrap", gap:16 }}>
          {[
            { label:"sunit6503@gmail.com", icon:"✉", action: copy, note: copied ? "Copied!" : null },
            { label:"+91 8637075992", icon:"📞", action: () => window.open("tel:+918637075992") },
            { label:"linkedin.com/in/srkr99", icon:"in", action: () => window.open("https://linkedin.com/in/srkr99","_blank") },
            { label:"github.com/sunitsarkar", icon:"⌥", action: () => window.open("https://github.com/sunitsarkar","_blank") },
          ].map(({ label, icon, action, note }) => (
            <button key={label} onClick={action} style={{
              display:"flex", alignItems:"center", gap:14,
              padding:"16px 24px",
              background:"var(--surface)", border:"1px solid var(--border)",
              borderRadius:6, color:"var(--text)", fontSize:14,
              fontFamily:"var(--font-mono)",
              transition:"border-color .3s, box-shadow .3s, transform .2s",
            }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(0,200,255,0.4)";e.currentTarget.style.boxShadow="var(--glow)";e.currentTarget.style.transform="translateY(-3px)"}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.boxShadow="none";e.currentTarget.style.transform="translateY(0)"}}
            >
              <span style={{ color:"var(--accent)" }}>{icon}</span>
              {note ? <span style={{ color:"var(--accent)" }}>{note}</span> : label}
            </button>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{
      borderTop:"1px solid var(--border)", padding:"28px 10vw",
      display:"flex", justifyContent:"space-between", alignItems:"center",
      zIndex:1, position:"relative", flexWrap:"wrap", gap:12,
    }}>
      <span style={{ fontFamily:"var(--font-mono)", color:"var(--muted)", fontSize:12 }}>
        © 2026 Sunit Sarkar — Electrical Engineer
      </span>
      <span style={{ fontFamily:"var(--font-mono)", color:"var(--muted)", fontSize:12 }}>
        Kolkata, India
      </span>
    </footer>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <div style={{ position:"relative" }}>
      <Cursor />
      <Particles />
      <Nav />
      <Hero />
      <Skills />
      <Experience />
      <Education />
      <Project />
      <Contact />
      <Footer />
    </div>
  );
}
