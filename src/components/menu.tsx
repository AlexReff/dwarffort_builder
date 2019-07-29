import * as _ from "lodash";
import { Component, h } from "preact";
import { MENU_ITEM, MENU_ITEMS, MENU_KEYS, SUBMENU_MAX_H } from "./constants";

interface IMenuItem {
    "text": string;
    "key": string;
    "id": MENU_ITEM;
    "children"?: IMenuItem[];
    "parent"?: IMenuItem;
}

interface IMenuProps {
    highlightedItem: string;
    selectedMenu: string;
    handleMenuEvent: (e: string) => void;
}

class Menu extends Component<IMenuProps, {}> {
    constructor(props: IMenuProps) {
        super();
    }

    render(props: IMenuProps, state: any) {
        return (
            <div class="menu-items" style={this.getMenuItemsCss()}>
                {this.getChildMenu(MENU_ITEMS, "top")}
            </div>
        );
    }

    private getMenuItemsCss = () => {
        return {
            minHeight: SUBMENU_MAX_H * 21,
        };
    }

    private menuItemClickHandler = (e) => {
        e.preventDefault();
        this.menuItemHandler(e.currentTarget.id);
    }

    private menuItemHandler = (key: string) => {
        if (key === "top") {
            this.props.handleMenuEvent("top");
        } else if (MENU_KEYS[key] != null) {
            this.props.handleMenuEvent(MENU_KEYS[key].id);
        }
    }

    //render each individual menu with separate keys
    private getChildMenu(items: IMenuItem[], group: string, prefix?: string) {
        if (typeof items === "undefined" ||
            items === null ||
            items.length === 0) {
            return;
        }

        const stack = [];
        const childStack = [];

        if (prefix == null || prefix.length === 0) {
            prefix = "";
        } else {
            prefix += ":";
        }

        for (const i of items) {
            stack.push((
                <a onClick={(e) => this.menuItemClickHandler(e)}
                    title={i.text}
                    class={"menu-item" + (this.props.highlightedItem != null && this.props.highlightedItem === i.id ? " active" : "")}
                    id={prefix + i.key}>{i.key}: {i.text}</a>
            ));
            if (i.children != null && i.children.length > 0) {
                childStack.push(this.getChildMenu(i.children, prefix + i.key, prefix + i.key));
            }
        }

        const thisMenu: any[] = [<div class={"submenu" + (this.props.selectedMenu === group ? " active" : "")}>{stack}</div>];

        return thisMenu.concat(childStack);
    }
}

export { Menu, IMenuItem };
