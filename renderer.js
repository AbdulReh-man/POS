const information = document.getElementById("info");
information.innerText = `This app is using Chrome (v${versions.chrome()}), Node.js (v${versions.node()}), and Electron (v${versions.electron()}).
It is built by ${versions.BuiltBy}`;


// const func = async () => {
//   const response = await window.versions.ping();
//   console.log("Hello : ", response); // prints out 'pong'
// };
// func();