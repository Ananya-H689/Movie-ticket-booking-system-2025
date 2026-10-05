import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

/* GLOBAL CSS */
const css = `
:root{--brand:#e50914;--bg:#f6f7fb;--card:#fff}
*{box-sizing:border-box}
body{font-family:Inter,Arial;margin:0;background:var(--bg)}
.header{background:linear-gradient(90deg,var(--brand),#ff5b5b);padding:10px 18px;color:#fff;display:flex;gap:12px;align-items:center}
.header img{width:44px;height:44px;border-radius:8px}
.container{max-width:1100px;margin:18px auto;padding:0 16px}
.movies{display:flex;flex-wrap:wrap;gap:18px}
.card{background:#fff;padding:12px;border-radius:12px;box-shadow:0 6px 20px rgba(0,0,0,.08);width:200px}
.card img{width:100%;height:280px;border-radius:8px;object-fit:cover}
.btn{background:var(--brand);color:#fff;padding:8px 12px;border-radius:8px;border:none;cursor:pointer;text-decoration:none;display:inline-block}
.grid{display:grid;grid-template-columns:repeat(8,1fr);gap:8px;padding:12px}
.seat{padding:10px;border-radius:6px;text-align:center;font-weight:600;cursor:pointer}
.available{background:#d1fae5;color:#064e3b}
.booked{background:#fee2e2;color:#7f1d1d;cursor:not-allowed}
.selected{outline:3px solid #2563eb}
.form{background:#fff;padding:18px;border-radius:12px;max-width:420px;margin:auto;box-shadow:0 6px 20px rgba(0,0,0,.08)}
.footer{padding:24px;text-align:center;color:#666}
table{border-collapse:collapse;width:100%;background:#fff;border-radius:10px;overflow:hidden}
td,th{padding:10px;border-bottom:1px solid #eee}
tr:last-child td{border-bottom:none}
`;
if (!document.getElementById("main-style")) {
  const s = document.createElement("style");
  s.id = "main-style"; s.innerHTML = css; document.head.appendChild(s);
}

/* API BASE */
const API = "http://localhost:5001/api";

/* MAIN APP */
export default function App() {
  return (
    <Router>
      <Header />
      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movie/:id" element={<MovieDetails />} />
          <Route path="/show/:id" element={<ShowDetails />} />
          <Route path="/seats/:id" element={<SeatSelection />} />
          <Route path="/confirm" element={<BookingConfirm />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/bookings" element={<BookingsList />} />
          <Route path="/edit-booking/:id" element={<EditBooking />} />
        </Routes>
      </div>
      <Footer />
    </Router>
  );
}

/* HEADER */
function Header() {
  return (
    <header className="header">
      <img src="https://cdn-icons-png.flaticon.com/512/3370/3370873.png" alt="" />
      <div style={{fontWeight:700,fontSize:20}}>Movie Booking</div>
      <div style={{marginLeft:"auto"}}>
        <Link to="/" style={{color:"#fff",marginRight:14}}>Home</Link>
        <Link to="/bookings" style={{color:"#fff",marginRight:14}}>Bookings</Link>
        <Link to="/login" style={{color:"#fff",marginRight:14}}>Login</Link>
        <Link to="/register" style={{color:"#fff"}}>Register</Link>
      </div>
    </header>
  );
}
const Footer = () => <footer className="footer">Made with ❤️ Movie Booking</footer>;

/* POSTER SELECTOR */
function posterFor(t) {
  t = t.toLowerCase();
  if (t.includes("kgf")) return "https://assets.gadgets360cdn.com/pricee/assets/product/202204/KGF_1650621686.jpg";
  if (t.includes("leo")) return "https://m.media-amazon.com/images/M/MV5BZWJlMDY3ZDQtNjA4Ny00YzA5LTgwZjEtMDNmNGU3YjA3ZGYwXkEyXkFqcGdeQXVyMTY3ODkyNDkz._V1_.jpg";
  if (t.includes("rrr")) return "https://m.media-amazon.com/images/M/MV5BYjdkNGZkNDQtYTBkYi00ZDc3LTkwYmYtY2E0NjVkNWM5YzYxXkEyXkFqcGdeQXVyMTUxNTU1NzEz._V1_.jpg";
  if (t.includes("jailer")) return "https://m.media-amazon.com/images/M/MV5BNzU5NGI2NDQtMzY3Zi00NmM4LTk3MzgtN2Y1ZjJkODM0NzAzXkEyXkFqcGdeQXVyMTY3ODkyNDkz._V1_.jpg";
  if (t.includes("devara")) return "https://m.media-amazon.com/images/M/MV5BNzVlNDY1MjUtZDYyNi00YzgzLTgxYTAtZjY5YjM5MmZjNjJhXkEyXkFqcGdeQXVyMTY3ODkyNDkz._V1_.jpg";
  return "https://via.placeholder.com/300x420?text=Poster";
}

/* HOME */
function Home() {
  const [movies, setMovies] = useState([]);
  useEffect(() => {
    axios.get(`${API}/movies`).then(res=>{
      setMovies(res.data.map(m=>({
        id:m.movie_id,title:m.title,genre:m.genre,poster:posterFor(m.title)
      })));
    });
  }, []);
  return (
    <>
      <h2>Now Showing</h2>
      <div className="movies">
        {movies.map(m=>(
          <div className="card" key={m.id}>
            <img src={m.poster} alt="" />
            <h3>{m.title}</h3>
            <p>{m.genre}</p>
            <Link className="btn" to={`/movie/${m.id}`}>View Shows</Link>
          </div>
        ))}
      </div>
    </>
  );
}

/* MOVIE DETAILS */
function MovieDetails() {
  const { id } = useParams();
  const [shows, setShows] = useState([]);
  useEffect(() => {
    axios.get(`${API}/shows?movie_id=${id}`).then(res=>setShows(res.data));
  }, [id]);
  return (
    <>
      <h2>Shows</h2>
      {shows.map(s=>(
        <div className="card" key={s.show_id}>
          <p><b>Date:</b> {s.show_date}</p>
          <p><b>Time:</b> {s.show_time}</p>
          <Link className="btn" to={`/seats/${s.show_id}`}>Select Seats</Link>
        </div>
      ))}
    </>
  );
}

/* SHOW DETAILS */
const ShowDetails = () => {
  const { id } = useParams();
  return (<><h2>Show {id}</h2><Link className="btn" to={`/seats/${id}`}>Pick Seats</Link></>);
};

/* SEAT SELECTION */
function SeatSelection() {
  const { id } = useParams();
  const [seats, setSeats] = useState([]);
  const [selected, setSelected] = useState([]);
  const nav = useNavigate();
  useEffect(() => {
    axios.get(`${API}/seats?show_id=${id}`).then(res=>setSeats(res.data));
  }, [id]);

  const toggle = s => {
    if (s.status==="booked") return;
    const sn = s.seat_number;
    setSelected(prev => prev.includes(sn) ? prev.filter(x=>x!==sn) : [...prev,sn]);
  };

  return (
    <>
      <h2>Select Seats</h2>
      <div className="grid">
        {seats.map(s=>(
          <div key={s.seat_id}
            className={s.status==="booked"?"seat booked":selected.includes(s.seat_number)?"seat selected":"seat available"}
            onClick={()=>toggle(s)}>
            {s.seat_number}
          </div>
        ))}
      </div>
      <button className="btn" onClick={()=>{
        if(selected.length===0)return alert("Choose seats");
        nav("/confirm",{state:{showId:id,seats:selected}});
      }}>Continue</button>
    </>
  );
}

/* CONFIRM BOOKING */
function BookingConfirm() {
  const { state } = useLocation();
  const nav = useNavigate();
  const seats = state?.seats || [];
  const showId = state?.showId;
  const [msg, setMsg] = useState("");

  const confirm = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) return nav("/login");

      const res = await axios.post(`${API}/bookings`, {
        user_id: user.user_id, show_id: showId, seats
      });

      const bookingId = res.data.booking_ids[0];
      nav("/payment",{state:{bookingId,amount:seats.length*250}});
    } catch (err) {
      setMsg("Booking failed");
    }
  };

  return (
    <>
      <h2>Confirm Booking</h2>
      <p><b>Show:</b> {showId}</p>
      <p><b>Seats:</b> {seats.join(", ")}</p>
      <button className="btn" onClick={confirm}>Confirm</button>
      <p>{msg}</p>
    </>
  );
}

/* PAYMENT */
function PaymentPage() {
  const { state } = useLocation();
  const { bookingId, amount } = state || {};
  const [mode,setMode]=useState("UPI");
  const [msg,setMsg]=useState("");

  const pay = async()=>{
    try{
      await axios.post(`${API}/payments`,{
        booking_id:bookingId,
        amount,
        payment_mode:mode
      });
      setMsg("Payment successful!");
    }catch{
      setMsg("Payment failed");
    }
  };

  return (
    <>
      <h2>Payment</h2>
      <p>Booking ID: {bookingId}</p>
      <p>Amount: ₹{amount}</p>
      <select value={mode} onChange={e=>setMode(e.target.value)} style={{padding:10}}>
        <option>UPI</option><option>Card</option><option>NetBanking</option>
      </select>
      <button className="btn" onClick={pay} style={{marginTop:12}}>Pay Now</button>
      <p>{msg}</p>
    </>
  );
}

/* LOGIN */
function Login(){
  const [form,setForm]=useState({email:"",password:""});
  const [msg,setMsg]=useState("");
  const nav=useNavigate();

  const submit=async e=>{
    e.preventDefault();
    try{
      const res=await axios.post(`${API}/auth/login`,form);
      localStorage.setItem("user",JSON.stringify(res.data.user));
      nav("/");
    }catch(err){setMsg("Login failed")}
  };

  return(
    <div className="form">
      <h2>Login</h2>
      <form onSubmit={submit}>
        <input placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} style={{padding:8,width:"100%",marginBottom:8}} />
        <input type="password" placeholder="Password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} style={{padding:8,width:"100%",marginBottom:8}} />
        <button className="btn">Login</button>
      </form>
      <p>{msg}</p>
    </div>
  );
}

/* REGISTER */
function Register(){
  const [form,setForm]=useState({name:"",email:"",phone:"",password:""});
  const [msg,setMsg]=useState("");
  const nav=useNavigate();

  const submit=async e=>{
    e.preventDefault();
    try{
      await axios.post(`${API}/auth/register`,form);
      nav("/login");
    }catch(err){setMsg("Registration failed")}
  };

  return(
    <div className="form">
      <h2>Register</h2>
      <form onSubmit={submit}>
        {["name","email","phone","password"].map(f=>(
          <input key={f}
            type={f==="password"?"password":"text"}
            placeholder={f.charAt(0).toUpperCase()+f.slice(1)}
            value={form[f]}
            onChange={e=>setForm({...form,[f]:e.target.value})}
            style={{padding:8,width:"100%",marginBottom:8}}
          />
        ))}
        <button className="btn">Register</button>
      </form>
      <p>{msg}</p>
    </div>
  );
}

/* BOOKINGS LIST */
function BookingsList() {
  const [data,setData]=useState([]);
  const nav=useNavigate();

  useEffect(()=>{ load(); },[]);

  const load=()=>axios.get(`${API}/bookings`).then(res=>setData(res.data));

  const del = async (id) => {
    if (!window.confirm("Delete booking?")) return;

    try {
      const res = await axios.delete(`${API}/bookings/${id}`);
      alert(res.data.message);  
      load(); 
    } catch (err) {
      alert("Failed to delete booking");
    }
  };

  return(
    <>
      <h2>Bookings</h2>
      <table>
        <thead><tr><th>User</th><th>Movie</th><th>Time</th><th>Seats</th><th>Actions</th></tr></thead>
        <tbody>
          {data.map(b=>(
            <tr key={b.booking_id}>
              <td>{b.user_name}</td>
              <td>{b.movie_title}</td>
              <td>{b.show_time}</td>
              <td>{Array.isArray(b.seats)?b.seats.join(", "):"-"}</td>
              <td>
                <button className="btn" onClick={()=>nav(`/edit-booking/${b.booking_id}`)}>Edit</button>
                <button className="btn" style={{background:"red",marginLeft:8}} onClick={()=>del(b.booking_id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}   // <-- THIS WAS MISSING


/* EDIT BOOKING */
function EditBooking(){
  const { id } = useParams();
  const [booking,setBooking]=useState(null);
  const [seats,setSeats]=useState([]);
  const [selected,setSelected]=useState([]);
  const nav=useNavigate();

  useEffect(()=>{
    async function load(){
      const b=await axios.get(`${API}/bookings/${id}`);
      setBooking(b.data);
      setSelected(Array.isArray(b.data.seats)?b.data.seats:[]);
      const seatData=await axios.get(`${API}/seats?show_id=${b.data.show_id}`);
      setSeats(seatData.data);
    }
    load();
  },[id]);

  const toggle=s=>{
    if(s.status==="booked") return;
    const sn=s.seat_number;
    setSelected(prev=>prev.includes(sn)?prev.filter(x=>x!==sn):[...prev,sn]);
  };

  const save=async()=>{
    await axios.put(`${API}/bookings/${id}`,{seats:selected});
    alert("Updated!");
    nav("/bookings");
  };

  if(!booking) return <h2>Loading...</h2>;

  return(
    <>
      <h2>Edit Booking #{booking.booking_id}</h2>
      <div className="grid">
        {seats.map(s=>(
          <div key={s.seat_id}
            className={s.status==="booked"?"seat booked":selected.includes(s.seat_number)?"seat selected":"seat available"}
            onClick={()=>toggle(s)}>
            {s.seat_number}
          </div>
        ))}
      </div>
      <button className="btn" onClick={save} style={{marginTop:12}}>Save</button>
    </>
  );
}