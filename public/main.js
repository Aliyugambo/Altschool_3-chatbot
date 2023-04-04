
    // Establish a socket connection to the server
      const socket = io(window.location.origin, {
        query: {
          sessionId: localStorage.getItem("sessionId"),
        },
      });

      // // Query DOM elements
      let users = document.getElementById("user_input");
      // let users = prompt("Please Enter Your Name")
      const inputField = document.getElementById("inputField");
      const chatBox = document.getElementById("chatBox");
      const sendButton = document.getElementById("sendButton");
      const bot_img = document.querySelector("bot-image");

      // Helper function to append a message to the chat box
      function appendMessage(message, sender) {
        const messageElement = document.createElement("div");
        messageElement.className = "message-text";
        messageElement.id = sender;
        messageElement.textContent = message;

        const timestamp = new Date().toLocaleTimeString();
        const timestampElement = document.createElement("span");
        timestampElement.className = "timestamp";
        timestampElement.textContent = timestamp;

        const messageContainer = document.createElement("div");
        const messageOuterContainer = document.createElement("div");
        messageContainer.className = "message-container " + sender;
        messageOuterContainer.className = "message-outer-container " + sender;
        messageElement.innerHTML = message.replace(/\n/g, "<br>");
        messageContainer.appendChild(messageElement);
        messageContainer.appendChild(timestampElement);

        // Append an image element if sender is "bot"
        if (sender === "bot") {
          const botImg = document.createElement("img");
          botImg.className = "chat-bot-image img";
          botImg.src =
            "./bot_pic.png";
          messageOuterContainer.appendChild(botImg);
          messageOuterContainer.appendChild(messageContainer);
        }
        // Append an image element if sender is "bot"
        else if (sender === "user") {
          messageOuterContainer.appendChild(messageContainer);
          const userImg = document.createElement("img");
          userImg.className = "chat-user-image img";
          userImg.src =
            "./user2.svg";
          messageOuterContainer.appendChild(userImg);
        }
        chatBox.appendChild(messageOuterContainer);
        chatBox.scrollTop = chatBox.scrollHeight;
      }

      // Handle sending messages
      // Define state variables
      let current_order = [];
      let order_history = [];
      let isPlacingOrder = false;

      function sendMessage() {
        const message = inputField.value;
        if (message === "") {
          return;
        }
        appendMessage(message, "user");

        if (!isPlacingOrder) {
          // User is not currently placing an order
          if (message === "1") {
            // User wants to start placing an order
            socket.emit(
              "bot-message",
              "Here is a list of items you can order:\n1: Bugger\n2: Pizzer\n3: Shawarmafried Rice\n4: fried-Rice\n5: Fried Rice\n\n If not:\n 97: Current Order\n 98: Order History"
            );
            isPlacingOrder = true;
          } else if (message === "98") {
            //When a  User wants to see their order history
            if (order_history.length < 1) {
              socket.emit(
                "bot-message",
                "Wow Such empty\n\nSelect below to Order\n1: Bugger\n2: Pizzer\n3: Shawarmafried Rice\n4: fried-Rice\n5: Fried Rice\n\n 97: Current Order\n99: Checkout"
              );
              isPlacingOrder = true;
              if (
                message === "1" ||
                message === "2" ||
                message === "3" ||
                message === "4" ||
                message === "5" ||
                message === "6" ||
                message === "7" ||
                message === "8" ||
                message === "9"
                
              ) {

                //When a  User has selected an item to order
                current_order.push(getItemName(message));
                socket.emit(
                  "bot-message",
                  `${getItemName(message)} has been added to your order.\n
        Do you want to add more items to your order?\n Select the options below\n1: Bugger\n2: Pizzer\n3: Shawarmafried Rice\n4: fried-Rice\n5: Fried Rice\n\n If not:\n 97: Current Order\n 98: Order History\n99: Checkout`
                );
              }
            } else if (order_history.length > 0) {
              isPlacingOrder = true;
              let orderHistoryMessage = "";
              const arr = [
                "First",
                "Second",
                "Third",
                "Fourth",
                "Fifth",
                "Seventh",
                "Eight",
                "Ninth",
                "Tenth",
              ];
              for (let i = 0; i < order_history.length; i++) {
                orderHistoryMessage +=
                  arr[i] + " Order: " + order_history[i].join(", ") + "\n";
                socket.emit(
                  "bot-message",
                  `${orderHistoryMessage}\n\nSelect below to continue order\n1: Bugger\n2: Pizzer\n3: Shawarmafried Rice\n4: fried-Rice\n5: Fried Rice\n\n97: Current Order\n99: Checkout\n0: Cancel Order`
                );
              }
            }
          } else if (message === "97") {
            if (current_order.length < 1) {
              isPlacingOrder = true;
              socket.emit(
                "bot-message",
                "No current order\nSelect below to place an order\n1: Bugger\n2: Pizzer\n3: Shawarmafried Rice\n4: fried-Rice\n5: Fried Rice\n\n98: Order History\n99: Checkout"
              );
            } else {
              isPlacingOrder = true;
              socket.emit(
                "bot-message",
                `Here is your current order: ${current_order.join(
                  ", "
                )}\n98: Order History\n99: Checkout`
              );
            }
          } else {
            socket.emit(
              "bot-message",
              "Invalid input\nSelect\n 1: To Place an order\n97: Current Order\n98: to see order history"
            );
          }
          inputField.value = "";
        } else {
          //If User is currently placing an order
          if (
            message === "1" ||
            message === "2" ||
            message === "3" ||
            message === "4" ||
            message === "5" ||
            message === "6" ||
            message === "7" ||
            message === "8" ||
            message === "9" 
           
          ) {

            //When a  User has selected an item to order
            current_order.push(getItemName(message));
            socket.emit(
              "bot-message",
              `${getItemName(message)} has been added to your order.\n
        Do you want to add more items to your order?\n Select the options below\n1: Bugger\n2: Pizzer\n3: Shawarmafried Rice\n4: fried-Rice\n5: Fried Rice\n\n If not:\n 97: Current Order\n 98: Order History\n99: Checkout`
            );
          } else if (message === "99") {

            // If a User wants to checkout
            if (current_order.length < 1) {
              socket.emit(
                "bot-message",
                "No order to place.\nSelect below to place an order\n1: Bugger\n2: Pizzer\n3: Shawarmafried Rice\n4: fried-Rice\n5: Fried Rice\n\n97: Current Order\n 98: Order History"
              );
            } else {
              socket.emit(
                "bot-message",
                "Order placed.\n 1: Place new order\n 97: Current Order\n 98: Order History\n 0: Cancel Order"
              );
              let order = [];
              order.push(current_order);
              order_history.push(current_order);
              current_order = [];
            }
          } else if (message === "97") {
            if (current_order.length < 1) {
              socket.emit(
                "bot-message",
                "No current order\nSelect below to place an order\n1: Bugger\n2: Pizzer\n3: Shawarmafried Rice\n4: fried-Rice\n5: Fried Rice\n\n 98: Order History\n99: Checkout"
              );
            } else {
              socket.emit(
                "bot-message",
                `Here is your current order: ${current_order.join(
                  ", "
                )}\n98: Order History\n99: Checkout\n0: Cancel Order`
              );
            }
            //If a User wants to see their order history
          } else if (message === "98") {
            if (order_history.length < 1) {
              socket.emit(
                "bot-message",
                "Wow Your Order is empty\n\nSelect below to place an order\n1: Bugger\n2: Pizzer\n3: Shawarmafried Rice\n4: fried-Rice\n5: Fried Rice\n\n97: Current Order\n99: Checkout"
              );
            } else if (order_history.length > 0) {
              let orderHistoryMessage = "";
              const arr = [
                "First",
                "Second",
                "Third",
                "Fourth",
                "Fifth",
                "Seventh",
                "Eight",
                "Ninth",
                "Tenth",
              ];
              for (let i = 0; i < order_history.length; i++) {
                orderHistoryMessage +=
                  arr[i] + " Order: " + order_history[i].join(", ") + "\n";
                socket.emit(
                  "bot-message",
                  `${orderHistoryMessage}\n\nSelect below to continue order\n1: Bugger\n2: Pizzer\n3: Shawarmafried Rice\n4: Beef\n5: Fried Rice\n\n97: Current Order\n99: Checkout\n0: Cancel Order`
                );
              }
            }

            //If User wants to cancel the order
          } else if (message === "0") {
            if (order_history.length < 1) {
              socket.emit(
                "bot-message",
                "No order to cancel\nSelect below to place an order\n1: Bugger\n2: Pizzer\n3: Shawarmafried Rice\n4: fried-Rice\n5: Fried Rice\n\n 97: Current Order\n 98: Order History"
              );
            } else {
              isPlacingOrder = false;
              order_history.pop(order_history);
              socket.emit(
                "bot-message",
                "Order cancelled.\n 1: Place an Order\n97: Current Order\n98: Order History"
              );
            }
          } else {
            socket.emit(
              "bot-message",
              "Invalid input\nSelect below to place an order\n1: Bugger\n2: Pizzer\n3: Shawarma\n4: fried-Rice\n5: Fried Rice\n\n97: Current Order\n 98: Order History\n 0: Cancel Order"
            );
          }
          inputField.value = "";
        }

        inputField.value = "";
      }

      function getItemName(itemNumber) {
        switch (itemNumber) {
          case "1":
            return "Bugger";
          case "2":
            return "Pizzer";
          case "3":
            return "Shawarma";
          case "4":
            return "fried-Rice";
          case "5":
            return "Fired Rice";
          case "6":
            return "Jollof Rice";
          case "7":
            return "Beans";
          case "8":
            return "White Rice";
          case "9":
            return "Macaronni";
        }
      }

      socket.on("connect", () => {

        users.addEventListener("keydown", (event)=>{
          if(event.key == "Enter"){
            appendMessage(
              `Hello ${users}\nWelcome to Mafuz_tech_solutions restaurant Do you wants to order something.\nDo so By Selecting Options\n1: To Place an order\n97: Current Order\n 98: Order History`,
              "bot"
            );
          }
          
        });
        // appendMessage(
        //   `Hello ${users}\nWelcome to Mafuz_tech_solutions restaurant Do you wants to order something.\nDo so By Selecting Options\n1: To Place an order\n97: Current Order\n 98: Order History`,
        //   "bot"
        // );
      });

      // Handling receiving messages from the server
      socket.on("bot-message", (message) => {
        appendMessage(message, "bot");
        chatMessage.save();
      });

      // Attaching event listeners
      sendButton.addEventListener("click", sendMessage);
      inputField.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          sendMessage();
        }
      });
    