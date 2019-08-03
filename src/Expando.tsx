import { makeStyles } from "@material-ui/styles";
import {
  Avatar,
  Button, ClickAwayListener,
  Dialog,
  DialogTitle,
  IconButton,
  InputBase,
  List,
  ListItem,
  ListItemAvatar, ListItemSecondaryAction,
  ListItemText, MenuItem, MenuList,
  Modal,
  Paper,
  Popper,
  Theme,
  Typography
} from '@material-ui/core'
import React, { useEffect, useRef, useState } from "react";
import {
  ExpandLess,
  ExpandMore,
  SettingsBackupRestore
} from "@material-ui/icons";
import useAsync from "react-use/lib/useAsync";
import axios from "axios";
import * as R from 'ramda'
const useExpandoStyles = makeStyles<
  Theme,
  { collapsed: boolean; roundTop: boolean; roundBottom: boolean }
>(theme => ({
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightMedium,
    gridColumn: 1,
    paddingTop: 4
  },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary,
    gridColumn: 2
  },
  grid: v => ({
    display: "grid",
    gridTemplateColumns: "fit-content(100%) 1fr auto",
    paddingLeft: 24,
    paddingRight: 16,
    gridGap: 24,
    gridTemplateRows: "fit-content(100%) fit-content(100%)",
    paddingTop: 12,
    height: "auto",
    maxHeight: v.collapsed ? 56 : 200,
    overflow: "hidden",
    marginTop: v.collapsed ? 0 : 8,
    marginBottom: v.collapsed ? 0 : 8,
    borderTopRightRadius:
      v.roundTop || !v.collapsed ? theme.shape.borderRadius : 0,
    borderTopLeftRadius:
      v.roundTop || !v.collapsed ? theme.shape.borderRadius : 0,
    borderBottomRightRadius:
      v.roundBottom || !v.collapsed ? theme.shape.borderRadius : 0,
    borderBottomLeftRadius:
      v.roundBottom || !v.collapsed ? theme.shape.borderRadius : 0,
    transition: theme.transitions.create("all", { duration: 300 })
  }),
  icon: {
    gridColumn: 3,
    marginTop: -8,
    marginBottom: -12
  },
  actions: {
    gridColumnStart: 1,
    gridColumnEnd: 4,
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 12,
    paddingRight: 0
  },
  button: {
    marginLeft: 8
  }
}));

interface ExpandoProps {
  collapsed: boolean;
  setCollapsed: (f?: boolean) => void;
  value: string;
  onChange: (a: string, c: string) => void;
  label: string;
  roundTop: boolean;
  roundBottom: boolean;
  id: string;
  invalidate:()=>void;
}

export function Expando({
  collapsed,
  setCollapsed,
  value,
  onChange,
  label,
  roundTop,
  roundBottom,
  id,
                          invalidate
}: ExpandoProps) {
  const classes = useExpandoStyles({ collapsed, roundTop, roundBottom });
  const iconRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLButtonElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [v, set_v] = useState(value);
  const [c, set_c] = useState("");
  const [open, set_open] = useState(false);
  useEffect(() => {
    set_v(value);
  }, [value]);
  const { value: item } = useAsync(() =>
    axios.get<
      Array<
        | {
            commitMsg: string;
            name: string;
            id: string;
            type: "MemberCreated";
            eventId: string;
          }
        | {
            commitMsg: string;
            name: string;
            oldName: string;
            id: string;
            type: "NameUpdated";
            eventId: string;
          }
      >
    >(`http://0.0.0.0:8080/members/${id}/events`)
  );
  return (
    <Paper
      className={classes.grid}
      square={collapsed}
      elevation={collapsed ? 2 : 4}
    >
      <IconButton
        className={classes.icon}
        onClick={() => setCollapsed()}
        ref={iconRef}
        style={{
          gridRow: 1
        }}
        edge="end"
      >
        {collapsed ? <ExpandMore /> : <ExpandLess />}
      </IconButton>
      <Typography className={classes.heading} style={{ gridRow: 1 }}>
        {label}
      </Typography>
      <InputBase
        className={classes.secondaryHeading}
        value={v}
        onChange={e => set_v(e.target.value)}
        disabled={collapsed}
        style={{ gridRow: 1 }}
        multiline={true}
        rows={1}
        ref={inputRef}
      />
      <Typography className={classes.heading} style={{ gridRow: 2 }}>
        Commit Message
      </Typography>
      <InputBase
        className={classes.secondaryHeading}
        placeholder={"commit message"}
        value={c}
        multiline={true}
        onChange={e => set_c(e.target.value)}
        rows={3}
        disabled={collapsed}
        style={{ gridRow: 2 }}
      />
      <div className={classes.actions} style={{ gridRow: 3 }}>
        <IconButton onClick={() => set_open(true)}>
          <SettingsBackupRestore />
        </IconButton>

        <Button
          variant="text"
          className={classes.button}
          disabled={collapsed}
          onClick={cancel}
          ref={cancelRef}
        >
          Cancel
        </Button>
        <Button
          variant="outlined"
          className={classes.button}
          disabled={collapsed}
          onClick={save}
          onKeyDown={e => {
            if (e.key === "Tab") {
              e.preventDefault();
              iconRef.current!.focus();
            }
          }}
        >
          Save
        </Button>
      </div>
      <Dialog
        onClose={() => set_open(false)}
        open={open}
        aria-labelledby="simple-dialog-title"
      >
        <DialogTitle id="simple-dialog-title">Set backup account</DialogTitle>
        <List>
          {item &&
            R.reverse(item.data).map(it => (
              <ListItem>
                <ListItemText
                  primary={it.commitMsg}
                  secondary={
                    it.type === "NameUpdated"
                      ? `${it.oldName} -> ${it.name}`
                      : `${it.name} was created`
                  }
                />
                <ListItemSecondaryAction>
                    <IconButton onClick={()=>{
                      axios.post(`http://0.0.0.0:8080/members/revert/name`,it).then(()=>invalidate())
                    }}>
                      <SettingsBackupRestore/>
                    </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
        </List>
      </Dialog>
    </Paper>
  );

  function save() {
    onChange(v, c);
    setCollapsed(true);
    iconRef.current!.focus();
  }

  function cancel() {
    setCollapsed(true);
    iconRef.current!.focus();
    set_v(value);
  }
}
