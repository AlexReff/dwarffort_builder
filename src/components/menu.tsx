import * as _ from "lodash";
import { Component, h } from "preact";
import { Constants, MenuItemId } from "./constants";

interface IMenuItem {
    "text": string;
    "key": string;
    "id": MenuItemId;
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

    menuItemClickHandler = (e) => {
        e.preventDefault();
        this.menuItemHandler(e.currentTarget.id);
    }

    breadcrumbHandler = (e: any) => {
        e.preventDefault();
        return this.menuItemHandler(e.currentTarget.dataset.id);
    }

    menuItemHandler = (key: string) => {
        if (key === "top") {
            this.props.handleMenuEvent("top");
        } else if (Constants.MENU_HOTKEYS[key] != null) {
            this.props.handleMenuEvent(Constants.MENU_HOTKEYS[key].id);
        }
    }

    //render each individual menu with separate keys
    getChildMenu(items: IMenuItem[], group: string, prefix?: string) {
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

    renderBreadcrumbs = (props: IMenuProps) => {
        const breadcrumbs = [];
        if (props.selectedMenu !== "top") {
            const activeItem = Constants.MENU_HOTKEYS[props.selectedMenu];
            breadcrumbs.push(<a href="#" data-id={activeItem.key} onClick={(e) => this.breadcrumbHandler(e)}>{activeItem.text}</a>);

            let parent = activeItem.parent;
            while (parent != null) {
                breadcrumbs.push(<a data-id={parent.key} onClick={(e) => this.breadcrumbHandler(e)}>{parent.text}</a>);
                parent = parent.parent;
            }
        }

        breadcrumbs.push(<a href="#" data-id="top" title="Main Menu" onClick={(e) => this.breadcrumbHandler(e)}>☺</a>);
        return breadcrumbs.reverse();
    }

    render(props: IMenuProps, state: any) {
        return (
            <div id="menu">
                <div class="menu-breadcrumbs">
                    {this.renderBreadcrumbs(props)}
                </div>
                <div class="menu-items">
                    {this.getChildMenu(Constants.MENU_ITEMS, "top")}
                </div>
                <div class="menu-bottom">
                    <div class="copy">&copy; {new Date().getFullYear()} Alex Reff</div>
                </div>
            </div>
        );
    }
}

export { Menu, IMenuItem };
