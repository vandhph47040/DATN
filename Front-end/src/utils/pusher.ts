import Pusher from "pusher-js";

const pusher = new Pusher("57e0771e37132e85c390", {
  cluster: "ap1",
  forceTLS: true,
});

export default pusher;
