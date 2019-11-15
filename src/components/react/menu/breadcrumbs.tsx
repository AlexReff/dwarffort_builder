import { h } from "preact";
import { handleMenuEvent } from ".";
import { IMenuItem, MENU, MENU_ID } from "../../constants";
import { useSelectors, useThunkDispatch } from "../../redux";

export const Breadcrumbs = () => {
    const dispatch = useThunkDispatch();
    const reduxState = useSelectors([
        "currentSubmenu",
    ]);

    const activeSubmenu: IMenuItem = MENU.ITEMS[reduxState.currentSubmenu];
    const breadcrumbTarget = (
        reduxState.currentSubmenu != null &&
        reduxState.currentSubmenu !== MENU_ID.top &&
        activeSubmenu != null &&
        activeSubmenu.text != null &&
        activeSubmenu.text.length > 0
    ) ? activeSubmenu : null;

    return (
        <div class="menu-breadcrumbs">
            <a href="#" title="Main Menu" onClick={(e) => handleMenuEvent(e, "top", dispatch)}>☺</a>
            {breadcrumbTarget != null ?
                <a href="#" onClick={(e) => handleMenuEvent(e, breadcrumbTarget.id, dispatch)}>{breadcrumbTarget.text}</a>
                : null}
        </div>
    );
};
