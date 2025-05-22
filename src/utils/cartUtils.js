export const getCartCount = () => {
  try {
    const storedCart = localStorage.getItem('cartItems');
    if (!storedCart) return 0;
    
    const cartItems = JSON.parse(storedCart);
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  } catch (error) {
    console.error("Error calculating cart count:", error);
    return 0;
  }
};

export const getCartItems = () => {
  try {
    const storedCart = localStorage.getItem('cartItems');
    return storedCart ? JSON.parse(storedCart) : [];
  } catch (error) {
    console.error("Error getting cart items:", error);
    return [];
  }
};

export const addCartItem = (item) => {
  try {
    const cartItems = getCartItems();
    
    const existingItemIndex = cartItems.findIndex(cartItem => {
      if (cartItem.id !== item.id) return false;
      
      if (!cartItem.variations || !item.variations) return false;
      if (cartItem.variations.length !== item.variations.length) return false;
      
      const cartItemVariationIds = cartItem.variations.map(v => v.id).sort();
      const itemVariationIds = item.variations.map(v => v.id).sort();
      
      return JSON.stringify(cartItemVariationIds) === JSON.stringify(itemVariationIds);
    });
    
    if (existingItemIndex >= 0) {
      cartItems[existingItemIndex].quantity += item.quantity;
    } else {
      cartItems.push(item);
    }

    localStorage.setItem('cartItems', JSON.stringify(cartItems));

    dispatchCartUpdatedEvent();
    
    return cartItems;
  } catch (error) {
    console.error("Error adding item to cart:", error);
    return getCartItems();
  }
};

export const removeCartItem = (index) => {
  try {
    const cartItems = getCartItems();
    
    if (index >= 0 && index < cartItems.length) {
      cartItems.splice(index, 1);
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
      
      dispatchCartUpdatedEvent();
    }
    
    return cartItems;
  } catch (error) {
    console.error("Error removing item from cart:", error);
    return getCartItems();
  }
};

export const updateCartItemQuantity = (index, quantity) => {
  try {
    const cartItems = getCartItems();
    
    if (index >= 0 && index < cartItems.length && quantity > 0) {
      cartItems[index].quantity = quantity;
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
      
      dispatchCartUpdatedEvent();
    }
    
    return cartItems;
  } catch (error) {
    console.error("Error updating cart item quantity:", error);
    return getCartItems();
  }
};

export const updateCartItem = (index, updatedItem) => {
  try {
    const cartItems = getCartItems();
    
    if (index >= 0 && index < cartItems.length) {
      cartItems[index] = updatedItem;
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
      
      // Dispatch custom event
      dispatchCartUpdatedEvent();
    }
    
    return cartItems;
  } catch (error) {
    console.error("Error updating cart item:", error);
    return getCartItems();
  }
};

export const getCartItemByIndex = (index) => {
  try {
    const cartItems = getCartItems();
    
    if (index >= 0 && index < cartItems.length) {
      return cartItems[index];
    }
    
    return null;
  } catch (error) {
    console.error("Error getting cart item:", error);
    return null;
  }
};

export const clearCart = () => {
  try {
    localStorage.removeItem('cartItems');
    
    dispatchCartUpdatedEvent();
    
    return [];
  } catch (error) {
    console.error("Error clearing cart:", error);
    return [];
  }
};

export const getCartTotal = () => {
  try {
    const cartItems = getCartItems();
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  } catch (error) {
    console.error("Error calculating cart total:", error);
    return 0;
  }
};

export const updateCartCount = (setCartCount) => {
  setCartCount(getCartCount());
};

export const dispatchCartUpdatedEvent = () => {
  const event = new Event('cartUpdated');
  window.dispatchEvent(event);
};

export default {
  getCartCount,
  getCartItems,
  addCartItem,
  removeCartItem,
  updateCartItemQuantity,
  updateCartItem,
  getCartItemByIndex,
  clearCart,
  getCartTotal,
  updateCartCount,
  dispatchCartUpdatedEvent
};