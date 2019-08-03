import React, { useState } from "react";
import "./App.css";
import {
  AppBar,
  CircularProgress,
  Container,
  InputBase,
  LinearProgress,
  MenuItem,
  Paper,
  Theme,
  Toolbar,
  Typography
} from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import SearchIcon from "@material-ui/icons/Search";
import { Expando } from "./Expando";
import { Expando as Expando2 } from "./Expando2";
import Downshift from "downshift";
import matchSorter from "match-sorter";
import axios from "axios";
import useAsync from "react-use/lib/useAsync";

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    marginTop: theme.spacing(2)
  }
}));
const useTopBarStyles = makeStyles<Theme>(theme => ({
  search: {
    borderRadius: theme.shape.borderRadius,
    "&:hover": {
      backgroundColor: "#585858"
    },
    width: "100%",
    position: "relative",
    zIndex: 1,
    marginRight: 0,
    marginLeft: 0
  },
  search2: {
    width: "100%",
    position: "relative",
    zIndex: 1,
    marginRight: theme.spacing(2),
    marginLeft: 0,
    [theme.breakpoints.up("sm")]: {
      marginLeft: theme.spacing(3)
    }
  },
  searchIcon: {
    width: theme.spacing(9),
    height: "100%",
    position: "absolute",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  inputRoot: {
    color: "inherit",
    width: "100%",
    position: "relative",
    zIndex: 100
  },
  inputInput: {
    paddingTop: theme.spacing(1),
    paddingRight: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    paddingLeft: theme.spacing(10),
    transition: theme.transitions.create("width"),
    width: "100%"
  },
  suggestions: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 0
  },
  loading: {
    display: "flex",
    justifyContent: "center"
  },
  progressRoot: {
    height: 2,
    backgroundColor: "hsla(0,100%,100%,0.04)"
  }
}));

interface Item {
  name: string;
  id: string;
}

function TopBar(p: { onChange(selectedItem: Item): void; i: number }) {
  const classes = useTopBarStyles();

  const { value: items, error, loading } = useAsync(
    () => axios.get<{ [id: string]: Item }>("http://0.0.0.0:8080/members"),
    [p.i]
  );
  console.log(items, error, loading);
  return (
    <AppBar position="static" color="default">
      <Toolbar>
        <Typography variant="h6" color="inherit">
          JF
        </Typography>
        <div className={classes.search2}>
          <Downshift
            onChange={p.onChange}
            itemToString={item => (item ? item.name : "")}
          >
            {({
              getInputProps,
              getItemProps,
              getMenuProps,
              isOpen,
              inputValue,
              highlightedIndex,
              selectedItem,
              openMenu
            }) => (
              <div
                className={classes.search}
                style={{
                  borderBottomLeftRadius: isOpen ? 0 : undefined,
                  borderBottomRightRadius: isOpen ? 0 : undefined,
                  backgroundColor: isOpen ? "#585858" : "#414141"
                }}
              >
                <div className={classes.searchIcon}>
                  <SearchIcon />
                </div>
                <InputBase
                  placeholder="Search…"
                  classes={{
                    root: classes.inputRoot,
                    input: classes.inputInput
                  }}
                  inputProps={getInputProps()}
                  onFocus={() => openMenu()}
                />
                {isOpen ? (
                  <Paper
                    className={classes.suggestions}
                    square={true}
                    elevation={6}
                    {...getMenuProps}
                  >
                    {loading
                      ? "loading"
                      : matchSorter(
                          items ? Object.values(items.data) : [],
                          inputValue || "",
                          {
                            keys: ["name", "id"]
                          }
                        ).map((item, index) => (
                          <MenuItem
                            {...getItemProps({ item: item })}
                            key={item.name}
                            selected={highlightedIndex === index}
                            component="div"
                          >
                            {item.name}
                          </MenuItem>
                        ))}
                  </Paper>
                ) : null}
              </div>
            )}
          </Downshift>
        </div>
      </Toolbar>
    </AppBar>
  );
}

function Member(props: { selectedItem: Item; invalidateSearch: () => void }) {
  const [s, set_s] = useState<string | null>(null);
  const [i, set_i] = useState(0);
  const { value: item, error, loading } = useAsync(
    () =>
      axios.get<Item>(`http://0.0.0.0:8080/members/${props.selectedItem.id}`),
    [i]
  );
  console.log(item, error, loading);
  return loading ? (
    <div>loading</div>
  ) : error ? (
    <div>error</div>
  ) : item ? (
    <>
      <Expando
        id={props.selectedItem.id}
        collapsed={s !== "1"}
        setCollapsed={getT("1")}
        value={item!.data.name}
        onChange={(name, commitMsg) => {
          axios
            .post(`http://0.0.0.0:8080/members/${props.selectedItem.id}/name`, {
              name,
              commitMsg
            })
            .then(() => {
              props.invalidateSearch();
              set_i(i + 1);
            });
        }}
        label={"Name"}
        roundTop={true}
        roundBottom={s === "2"}
        invalidate={() => {
          props.invalidateSearch();
          set_i(i + 1);
        }}
      />
      <Expando2
        id={""}
        collapsed={s !== "2"}
        setCollapsed={getT("2")}
        value={"infinite loop 1"}
        onChange={(name, commitMsg) => {}}
        label={"Address"}
        roundTop={s === "1"}
        roundBottom={true}
        invalidate={() => {
          props.invalidateSearch();
          set_i(i + 1);
        }}
      />
    </>
  ) : null;

  function getT(t: string) {
    return (b: boolean | undefined) => {
      if (b === undefined) {
        set_s(s !== t ? t : null);
      } else {
        set_s(b ? null : t);
      }
    };
  }
}

const App: React.FC = () => {
  const classes = useStyles();
  const [selectedItem, set_selectedItem] = useState<Item | undefined>(
    undefined
  );
  const [i, set_i] = useState(0);
  return (
    <div className="App">
      <TopBar onChange={set_selectedItem} i={i} />
      <Container className={classes.container}>
        {selectedItem ? (
          <Member
            key={selectedItem.id}
            selectedItem={selectedItem}
            invalidateSearch={() => set_i(i + 1)}
          />
        ) : null}
      </Container>
    </div>
  );
};

export default App;
