import { Link } from "react-router-dom";

function CartOverview() {
  return (
    <div className="bg-stone-800 uppercase text-stone-200 px-4 py-4 sm:px-6 text-sm md:text-base flex items-center justify-between">
      <p className="text-stone-200 font-semibold space-x-4 sm:space-x-6 justify-between">
        <span>23 pizzas</span>
        <span>$23.45</span>
      </p>
      <Link to="/cart" className="f">Open cart &rarr;</Link>
    </div>
  );
}

export default CartOverview;
