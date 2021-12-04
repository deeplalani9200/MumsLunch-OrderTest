import { serviceMaker, methods } from "../Index";
import { getEncryptedText } from "../../Shared/functions";

export const LOGIN = (payload) => serviceMaker(`/login`, methods.POST, payload);
export const GET_PARENT_STUDENT_EVENT_LIST = () => serviceMaker(`/student-events`, methods.GET);
export const GET_RESTAURANT_MENU_ID = (payload) => serviceMaker(`/restaurant-menu?id_vendor=${getEncryptedText(payload?.id_vendor.toString())}&eventId=${getEncryptedText(payload?.eventId.toString())}`, methods.GET);
export const GET_CART_BY_ID = (payload) => serviceMaker(`/get-cart-items?parentId=${payload}`, methods.GET);
export const LOGOUT = (payload) => serviceMaker(`/logout`, methods.POST, payload);
export const ADD_TO_CART = (payload) => serviceMaker(`/add-to-cart`, methods.POST, payload);
export const REMOVE_CART_ITEMS = (payload) => serviceMaker(`/remove-cart-items`, methods.POST, payload);
export const UPDATE_CART_ITEM_QTY = (payload) => serviceMaker(`/update-cart-item-qty`, methods.POST, payload);
export const STRIPE_CREATE_ORDER = (payload) => serviceMaker(`/stripe-create-order`, methods.POST, payload);
export const STRIPE_PAYMENT_CAPTURE = (payload) => serviceMaker(`/stripe-payment-capture`, methods.POST, payload);
export const ADD_ORDER_NOW = (payload) => serviceMaker(`/orders`, methods.POST, payload);
export const CANCEL_ORDER_NOW = (payload) => serviceMaker(`/cancel-order`, methods.POST, payload);