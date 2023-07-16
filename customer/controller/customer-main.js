/*---------- UTILITIES ----------*/

// format giá ra tiền Việt
function formatPrice(price) {
    const formattedPrice = parseFloat(price).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
    return formattedPrice;
}


/*---------- INITIALIZES  ----------*/

// load sản phẩm từ API
let products = [];
function getProductList() {
    let promise = axios({
        url: 'https://649d36a19bac4a8e669d62a2.mockapi.io/product',
        method: 'GET',
    });
    promise
        .then(function (result) {
            console.log('result: ', result.data);
            products = result.data;
            renderProductList(products);
        })
        .catch(function (error) {
            console.log(error);
        });
}
getProductList();

// load giỏ hàng từ local storage
function loadCart() {
    const data = localStorage.getItem('cart');
    if (data) {
        const items = JSON.parse(data);
        cart = new Cart();
        cart.items = items;
    } else {
        cart = new Cart();
    }
    renderCartItems();
    renderCartTotal();
}

loadCart();


/*---------- CONTROLLERS ----------*/

// icon giỏ hàng
$('#cartIcon').click(function () {
    cart = Cart.localStorageLoad();
    renderCartItems();
    renderCartTotal();
    $('#cartZone').toggle();
});

// xóa sản phẩm khỏi giỏ hàng (dựa theo id)
function deleteCartItem() {
    const productId = $(this).data('productId');
    const index = cart.items.findIndex((item) => item.id === productId);
    if (index !== -1) {
        cart.items.splice(index, 1);
        cart.localStorageSave();
        renderCartItems();
        renderCartTotal();
    }
}

//thêm sản phẩm vào giỏ hàng (dựa theo id)
function addToCart(productId) {
  const product = products.find((product) => product.id === productId);
  if (product) {
    const productName = product.name;
    const price = parseFloat(product.price);
    const quantity = parseInt($('#quantity-input').val());
    const image = product.image;

    const existingCartItem = cart.items.find(
      (item) => item.name === productName && item.status === 'đã thêm'
    );

    if (existingCartItem) {
      existingCartItem.quantity += quantity;
    } else {
      const newItem = new CartItem(productName, price, quantity, image);
      cart.addItem(newItem);
    }
    renderCartItems();
    const productDiv = $(`.product[data-name="${productName}"]`);
    productDiv.addClass('product-saved');
    $('#cartZone').css('display', 'block');
    cart.localStorageSave(); 
    $('.close').click();
    const addAccordionPanel = $('#cartAdd');
    const orderAccordionPanel = $('#cartOrder');
    const isAddAccordionVisible = addAccordionPanel.hasClass('show');
    const isOrderAccordionVisible = orderAccordionPanel.hasClass('show');
    if (isOrderAccordionVisible && !isAddAccordionVisible) {
      orderAccordionPanel.collapse('toggle');
      addAccordionPanel.collapse('toggle');
    }
  } else {
    console.error('Error');
  }
}

//reset giỏ hàng
$('#btnReset').click(function () {
  if (confirm('Xác nhận xoá giỏ hàng?')) {
      cart.items = [];
      cart.localStorageSave();
      renderCartItems();
  }
});


$(document).on('click', '.btn-add-to-cart', function (event) {
    const productId = $(this).data('productId');
    addToCart(productId);
    event.preventDefault();
    event.stopPropagation();
});


$('#btnOrder').click(function () {
  const addedItems = $('.cart-item');
  const orderedItems = $('.order-item');
  const invoiceTable = $('.cart-table-order');

  if (addedItems.children().length === 0 && orderedItems.children().length === 0) {
    alert('Không có sản phẩm trong giỏ hàng');
    return;
  }

  if (confirm('Xác nhận đặt hàng?')) {
    const itemsToMove = cart.items.filter((item) => item.status === 'đã thêm');
    for (const item of itemsToMove) {
      item.status = 'đã đặt hàng';
    }
    renderCartItems();
    renderOrderItems(); 
    let totalOrderPrice = 0;
    for (const orderItem of cart.items) {
      if (orderItem.status === 'đã đặt hàng') {
        totalOrderPrice += orderItem.price * orderItem.quantity;
      }
    }
    $('.order-total').text(formatPrice(totalOrderPrice));
    addedItems.empty();
    invoiceTable.show();
    $('#cartOrderHeading > button').click();
    cart.localStorageSave();
  }
});




// Remove item from add table
$(document).on('click', '.btnRemoveAdd', function () {
    const productName = $(this).data('name');
    const itemToRemove = cart.items.find((item) => item.name === productName && item.status === 'đã thêm');
    if (itemToRemove) {
      if (confirm('Xác nhận xoá sản phẩm?')) {
        cart.deleteItem(itemToRemove);
        renderCartItems();
      }
    }
  });
  
  // Remove item from invoice table
  $(document).on('click', '.btnRemoveOrder', function () {
    const productName = $(this).data('name');
    const itemToRemove = cart.items.find((item) => item.name === productName && item.status === 'đã đặt hàng');
    if (itemToRemove) {
      if (confirm('Xác nhận xoá sản phẩm?')) {
        cart.deleteItem(itemToRemove);
        renderCartItems();
      }
    }
  });
  
  























