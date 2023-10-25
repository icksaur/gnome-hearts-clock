const St = imports.gi.St;
const Clutter = imports.gi.Clutter;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const Mainloop = imports.mainloop;

const heartString = "♥";
const fullStyle = "full-heart";
const emptyStyle = "empty-heart";

const bedtime = 24;

class HeartsUntilBedtimeExtension {
    constructor() {
        this._indicator = null;
        this._timeoutSource = null;
        this._hearts = [null, null, null];
    }

    calculateHearts() {
        let hour = new Date().getHours();

        if (hour < 8) hour = 24;

        for (let i=0; i<3; i++) {
            this._hearts[i].style_class = hour < bedtime+(i-2) ? fullStyle : emptyStyle;
        }
    }
    
    enable() {
        log("enabling ${Me.metadata.name}");

        let indicatorName = "${Me.metadata.name} Indicator";
        
        // Create a panel button for adding config later
        this._indicator =
            new PanelMenu.Button(0.0, indicatorName, false);

        // Box layouts allow multiple sub-widgets
        let box = new St.BoxLayout();

        for (let i=0;i<3;i++) {
            this._hearts[i] = new St.Label({
                text: heartString,
                y_align: Clutter.ActorAlign.CENTER, // vertically aligns hearts
            });
            box.add(this._hearts[i]);
        }

        this._indicator.add_child(box);

        // `Main.panel` is the actual panel you see at the top of the screen,
        // not a class constructor.
        Main.panel.addToStatusArea(indicatorName, this._indicator);

        this.calculateHearts();

        // schedule a timer to calculate the heart colors
        this._timeoutSource = Mainloop.timeout_add_seconds(30, () => {
            this.calculateHearts();
            return true; // false or no return will cause this to only fire once
        });
    }
    
    // It's required for extensions to clean up after themselves when
    // they are disabled. This is required for approval during review!
    disable() {
        log("disabling ${Me.metadata.name}");

        this._indicator.destroy();
        this._indicator = null;
        Mainloop.source_remove(this._timeoutSource);
    }
}

function init() {
    log("initializing ${Me.metadata.name}");
    
    return new HeartsUntilBedtimeExtension();
}
