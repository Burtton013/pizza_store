import { Form, redirect, useActionData, useNavigation } from "react-router-dom";
import { createOrder } from "../../services/apiRestaurant";
import Button from "../../ui/Button";
import { useSelector } from "react-redux";
import { clearCart, getCart, getTotlaCartPrice } from "../cart/cartSlice";
import EmptyCart from "../cart/EmptyCart";
import store from "../../store";
import { formatCurrency } from "../../utils/helpers";
import { useState } from "react";

// https://uibakery.io/regex-library/phone-number
const isValidPhone = (str) =>
  /^\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/.test(
    str,
  );

function CreateOrder() {
  const userName = useSelector((state) => state.user.userName);
  //Error handling condo hacemos submmit
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  //Custom hook para acceder a la data que nos arroja nuestra action function y retornar los errores en la UI
  const formErrors = useActionData();
  const [withPriority, setWithPriority] = useState(false);
  const cart = useSelector(getCart);
  const totalCartPrice = useSelector(getTotlaCartPrice);
  const priorityPrice = withPriority ? totalCartPrice * 0.2 : 0;
  const totalPrice = totalCartPrice + priorityPrice;
  if (!cart.length) return <EmptyCart />;

  return (
    <div className="px-4 py-6">
      <h2 className="taext-xl mb-8 font-semibold">Ready to order? Let's go!</h2>

      {/* <Form method="POST" action="/order/new"> */}
      <Form method="POST">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="sm:basis-40">First Name</label>
          <input
            type="text"
            name="customer"
            defaultValue={userName}
            required
            className="input grow"
          />
        </div>

        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="sm:basis-40">Phone number</label>
          <div className="grow">
            <input type="tel" name="phone" required className="input w-full" />
            {/* Manejo del error telefono */}
            {formErrors?.phone && (
              <p className="mt-2 rounded-md bg-red-100 p-2 text-xs text-red-700">
                {formErrors.phone}
              </p>
            )}
          </div>
        </div>

        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="sm:basis-40">Address</label>
          <div className="grow">
            <input
              type="text"
              name="address"
              required
              // className="w-full px-4 py-2 text-sm transition-all duration-300 border rounded-full border-stone-200 placeholder:text-stone-400 focus:outline-none focus:ring focus:ring-yellow-400 md:px-6 md:py-3"
              className="input w-full"
            />
          </div>
        </div>

        <div className="mb-12 flex items-center gap-5">
          <input
            type="checkbox"
            name="priority"
            id="priority"
            value={withPriority}
            onChange={(e) => setWithPriority(e.target.checked)}
            className="h-6 w-6 accent-yellow-400 focus:outline-none focus:ring focus:ring-yellow-400 focus:ring-offset-2"
          />
          <label htmlFor="priority" className="font-medium">
            Want to yo give your order priority?
          </label>
        </div>

        <div>
          {/* Transformando directamente el value en json para hacer el post */}
          <input type="hidden" name="cart" value={JSON.stringify(cart)} />
          {/* Revisar para handling de submitting */}
          <Button disabled={isSubmitting} type="primary">
            {isSubmitting
              ? "Placing Order"
              : `Order now for ${formatCurrency(totalPrice)} `}
          </Button>
        </div>
      </Form>
    </div>
  );
}
//------ Action Function
//Busqueda por ID de una orden

export async function action({ request }) {
  //Obtenemos la data del forms
  const formData = await request.formData();
  const data = Object.fromEntries(formData);

  //Creamos nuevo objeto order con la data recibida
  const order = {
    ...data,
    cart: JSON.parse(data.cart),
    priority: data.priority === "true",
  };

  const errors = {};

  if (!isValidPhone(order.phone))
    errors.phone = "Please give us your correct phone number";

  if (Object.keys(errors).length > 0) return errors;

  //Si todo esta bien se crea el nuevo objeto y redirige

  const newOrder = await createOrder(order);

  //No sobre usar por cuestiones de rendimiento - vaciando el carrito una vez echa la orden
  store.dispatch(clearCart());

  //Obtenemos de vuelta  el nuevo objeto newOrder

  //Redirigimos de inmediato a `/order/${newOrder.id}`
  return redirect(`/order/${newOrder.id}`);
}

export default CreateOrder;
