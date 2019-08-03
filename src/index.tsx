import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import { createMuiTheme, CssBaseline } from "@material-ui/core";
import { ThemeProvider } from "@material-ui/styles";
import { pink, lightBlue, purple } from "@material-ui/core/colors";
import { lighten } from "@material-ui/core/styles";

let primeBg = "#292929"
const theme = createMuiTheme({
  palette: {
    type: "dark",
    primary: {
      main: purple[500]
    },
    background: {
      default: lighten(primeBg, 0.0)
    }
  },
  overrides: {
    MuiPaper: {
      elevation0: {
        background: lighten(primeBg, 0.0)
      },
      elevation1: {
        background: lighten(primeBg, 0.05)
      },
      elevation2: {
        background: lighten(primeBg, 0.07)
      },
      elevation3: {
        background: lighten(primeBg, 0.08)
      },
      elevation4: {
        background: lighten(primeBg, 0.09)
      },
      elevation5: {
        background: lighten(primeBg, 0.1)
      },
      elevation6: {
        background: lighten(primeBg, 0.11)
      },
      elevation8: {
        background: lighten(primeBg, 0.12)
      },
      elevation12: {
        background: lighten(primeBg, 0.14)
      },
      elevation16: {
        background: lighten(primeBg, 0.15)
      },
      elevation24: {
        background: lighten(primeBg, 0.16)
      }
    }
  }
});
function Root() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  );
}
ReactDOM.render(<Root />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
