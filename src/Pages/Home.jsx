import NavBar from "../Layout/NavBar.jsx";
import Hero from "../Layout/Hero.jsx";
import ListItems from "../components/ListItems.jsx";
const Home = () => {
  return (
    <main className="text">
      <NavBar showSearchbtn={true} />
      <Hero />
      <ListItems />
    </main>
  );
};

export default Home;
