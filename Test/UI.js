var UI;
(function (UI) {
    var ƒ = FudgeCore;
    class FieldSet extends HTMLFieldSetElement {
        values;
        constructor(_name = "FieldSet") {
            super();
            this.name = _name;
            let legend = document.createElement("legend");
            legend.textContent = this.name;
            this.appendChild(legend);
        }
        get() {
            for (let key in this.values) {
                let input = this.querySelector("#" + key);
                this.values[key] = Number(input.value);
            }
            return this.values;
        }
        set(_values) {
            for (let key in _values) {
                let input = this.querySelector("#" + key);
                if (input)
                    input.value = String(_values[key]);
            }
        }
        disable(_config) {
            for (let key in _config) {
                let input = this.querySelector("#" + key);
                input.disabled = _config[key];
            }
        }
    }
    UI.FieldSet = FieldSet;
    class Stepper extends HTMLSpanElement {
        constructor(_label = "Stepper", params = {}) {
            super();
            this.textContent = _label + " ";
            let stepper = document.createElement("input");
            stepper.name = _label;
            stepper.type = "number";
            stepper.id = _label;
            stepper.step = String(params.step) || "1";
            this.appendChild(stepper);
        }
    }
    UI.Stepper = Stepper;
    class Border extends FieldSet {
        constructor(_name = "Border", _step = 1) {
            super(_name);
            this.values = { left: 0, right: 0, top: 0, bottom: 0 };
            this.appendChild(new Stepper("left", { step: _step }));
            this.appendChild(new Stepper("top", { step: _step }));
            this.appendChild(new Stepper("right", { step: _step }));
            this.appendChild(new Stepper("bottom", { step: _step }));
        }
    }
    UI.Border = Border;
    class Rectangle extends FieldSet {
        constructor(_name = "Rectangle") {
            super(_name);
            this.values = { x: 0, y: 0, width: 0, height: 0 };
            this.appendChild(new Stepper("x", { step: 10 }));
            this.appendChild(new Stepper("y", { step: 10 }));
            this.appendChild(new Stepper("width", { step: 10 }));
            this.appendChild(new Stepper("height", { step: 10 }));
        }
        set(_rect) {
            let values = { x: _rect.x, y: _rect.y, width: _rect.width, height: _rect.height };
            super.set(values);
        }
        get() {
            // tslint:disable no-any
            let _rect = super.get();
            return new ƒ.Rectangle(_rect.x, _rect.y, _rect.width, _rect.height);
        }
        appendButton(_label) {
            let button = document.createElement("button");
            button.textContent = _label;
            this.appendChild(button);
        }
        appendCheckbox(_label) {
            let checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = true;
            this.appendChild(checkbox);
        }
        isLocked() {
            let checkbox = this.querySelector("[type=checkbox]");
            return !checkbox.checked;
        }
        disableAll(_disable) {
            super.disable({ x: true, y: true, width: true, height: true });
        }
    }
    UI.Rectangle = Rectangle;
    class Camera extends FieldSet {
        constructor(_name = "Camera") {
            super(_name);
            this.values = { aspect: 0, fieldOfView: 0, near: 0, far: 0 };
            this.appendChild(new Stepper("fieldOfView", { min: 5, max: 100, step: 5, value: 45 }));
            this.appendChild(new Stepper("aspect", { min: 0.1, max: 10, step: 0.1, value: 1 }));
            this.appendChild(new Stepper("near", { min: 0.01, max: 10, step: 0.01, value: 1 }));
            this.appendChild(new Stepper("far", { min: 1, max: 1000, step: 0.5, value: 10 }));
        }
    }
    UI.Camera = Camera;
    class Point extends FieldSet {
        constructor(_name = "Point") {
            super(_name);
            this.values = { x: 0, y: 0 };
            this.appendChild(new Stepper("x", { value: 0 }));
            this.appendChild(new Stepper("y", { value: 0 }));
            super.disable({ x: true, y: true });
        }
    }
    UI.Point = Point;
    class FramingScaled extends FieldSet {
        result;
        constructor(_name = "FramingScaled") {
            super(_name);
            this.values = { normWidth: 1, normHeight: 1 };
            this.result = new Rectangle("Result");
            this.result.disableAll(true);
            this.appendChild(this.result);
            this.appendChild(new Stepper("normWidth", { step: 0.1, value: 1 }));
            this.appendChild(new Stepper("normHeight", { step: 0.1, value: 1 }));
        }
        set(_values) {
            if (_values["Result"])
                this.result.set(_values["Result"]);
            else
                super.set(_values);
        }
    }
    UI.FramingScaled = FramingScaled;
    class FramingComplex extends FieldSet {
        constructor(_name = "FramingComplex") {
            super(_name);
            this.values = { Result: {}, Padding: {}, Margin: {} };
            let result = new Rectangle("Result");
            result.disableAll(true);
            this.appendChild(result);
            this.appendChild(new Border("Padding", 1));
            this.appendChild(new Border("Margin", 0.1));
        }
        get() {
            for (let child of this.children) {
                let fieldSet = child;
                let name = fieldSet.name;
                if (!this.values[name])
                    continue;
                this.values[name] = fieldSet.get();
            }
            return this.values;
        }
        set(_values) {
            for (let child of this.children) {
                let fieldSet = child;
                let name = fieldSet.name;
                if (!_values[name])
                    continue;
                fieldSet.set(_values[name]);
            }
        }
    }
    UI.FramingComplex = FramingComplex;
    class FPS extends HTMLSpanElement {
        constructor() {
            super();
            ƒ.Loop.addEventListener("loopFrame" /* ƒ.EVENT.LOOP_FRAME */, this.update);
        }
        update = () => {
            this.innerText = "FPS: " + ƒ.Loop.fpsRealAverage.toFixed(0);
        };
    }
    UI.FPS = FPS;
    class Time extends HTMLSpanElement {
        constructor() {
            super();
            ƒ.Loop.addEventListener("loopFrame" /* ƒ.EVENT.LOOP_FRAME */, this.update);
        }
        update = () => {
            this.innerText = "Time: " + this.get();
        };
        get = () => {
            return ƒ.Time.game.get().toFixed(0);
        };
    }
    UI.Time = Time;
    customElements.define("ui-stepper", Stepper, { extends: "span" });
    customElements.define("ui-framingcomplex", FramingComplex, { extends: "fieldset" });
    customElements.define("ui-scale", FramingScaled, { extends: "fieldset" });
    customElements.define("ui-rectangle", Rectangle, { extends: "fieldset" });
    customElements.define("ui-border", Border, { extends: "fieldset" });
    customElements.define("ui-camera", Camera, { extends: "fieldset" });
    customElements.define("ui-point", Point, { extends: "fieldset" });
    customElements.define("ui-fieldset", FieldSet, { extends: "fieldset" });
    customElements.define("ui-fps", FPS, { extends: "span" });
    customElements.define("ui-time", Time, { extends: "span" });
})(UI || (UI = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVUkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJVSS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFVLEVBQUUsQ0F5Tlg7QUF6TkQsV0FBVSxFQUFFO0lBQ1YsSUFBTyxDQUFDLEdBQUcsU0FBUyxDQUFDO0lBS3JCLE1BQWEsUUFBUyxTQUFRLG1CQUFtQjtRQUNyQyxNQUFNLENBQUs7UUFDckIsWUFBbUIsUUFBZ0IsVUFBVTtZQUMzQyxLQUFLLEVBQUUsQ0FBQztZQUNSLElBQUksQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDO1lBQ2xCLElBQUksTUFBTSxHQUFzQixRQUFRLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ2pFLE1BQU0sQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztZQUMvQixJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzNCLENBQUM7UUFFTSxHQUFHO1lBQ1IsS0FBSyxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQzVCLElBQUksS0FBSyxHQUFxQixJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQztnQkFDNUQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3pDLENBQUM7WUFDRCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDckIsQ0FBQztRQUVNLEdBQUcsQ0FBQyxPQUFXO1lBQ3BCLEtBQUssSUFBSSxHQUFHLElBQUksT0FBTyxFQUFFLENBQUM7Z0JBQ3hCLElBQUksS0FBSyxHQUFxQixJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQztnQkFDNUQsSUFBSSxLQUFLO29CQUNQLEtBQUssQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ3ZDLENBQUM7UUFDSCxDQUFDO1FBQ00sT0FBTyxDQUFDLE9BQVc7WUFDeEIsS0FBSyxJQUFJLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQztnQkFDeEIsSUFBSSxLQUFLLEdBQXFCLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDO2dCQUM1RCxLQUFLLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNoQyxDQUFDO1FBQ0gsQ0FBQztLQUNGO0lBL0JZLFdBQVEsV0ErQnBCLENBQUE7SUFFRCxNQUFhLE9BQVEsU0FBUSxlQUFlO1FBQzFDLFlBQW1CLFNBQWlCLFNBQVMsRUFBRSxTQUF3RSxFQUFFO1lBQ3ZILEtBQUssRUFBRSxDQUFDO1lBQ1IsSUFBSSxDQUFDLFdBQVcsR0FBRyxNQUFNLEdBQUcsR0FBRyxDQUFDO1lBQ2hDLElBQUksT0FBTyxHQUFxQixRQUFRLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ2hFLE9BQU8sQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDO1lBQ3RCLE9BQU8sQ0FBQyxJQUFJLEdBQUcsUUFBUSxDQUFDO1lBQ3hCLE9BQU8sQ0FBQyxFQUFFLEdBQUcsTUFBTSxDQUFDO1lBQ3BCLE9BQU8sQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUM7WUFDMUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM1QixDQUFDO0tBQ0Y7SUFYWSxVQUFPLFVBV25CLENBQUE7SUFFRCxNQUFhLE1BQU8sU0FBUSxRQUFRO1FBQ2xDLFlBQW1CLFFBQWdCLFFBQVEsRUFBRSxRQUFnQixDQUFDO1lBQzVELEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNiLElBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUM7WUFDdkQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxNQUFNLEVBQUUsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3ZELElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxPQUFPLENBQUMsS0FBSyxFQUFFLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN0RCxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksT0FBTyxDQUFDLE9BQU8sRUFBRSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDeEQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxRQUFRLEVBQUUsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzNELENBQUM7S0FDRjtJQVRZLFNBQU0sU0FTbEIsQ0FBQTtJQUVELE1BQWEsU0FBVSxTQUFRLFFBQVE7UUFDckMsWUFBbUIsUUFBZ0IsV0FBVztZQUM1QyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDYixJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDO1lBQ2xELElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNqRCxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDakQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxPQUFPLEVBQUUsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3JELElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxPQUFPLENBQUMsUUFBUSxFQUFFLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUN4RCxDQUFDO1FBRU0sR0FBRyxDQUFDLEtBQWtCO1lBQzNCLElBQUksTUFBTSxHQUFPLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUN0RixLQUFLLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3BCLENBQUM7UUFDTSxHQUFHO1lBQ1Isd0JBQXdCO1lBQ3hCLElBQUksS0FBSyxHQUErQixLQUFLLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDcEQsT0FBTyxJQUFJLENBQUMsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3RFLENBQUM7UUFFTSxZQUFZLENBQUMsTUFBYztZQUNoQyxJQUFJLE1BQU0sR0FBc0IsUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNqRSxNQUFNLENBQUMsV0FBVyxHQUFHLE1BQU0sQ0FBQztZQUM1QixJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzNCLENBQUM7UUFFTSxjQUFjLENBQUMsTUFBYztZQUNsQyxJQUFJLFFBQVEsR0FBcUIsUUFBUSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNqRSxRQUFRLENBQUMsSUFBSSxHQUFHLFVBQVUsQ0FBQztZQUMzQixRQUFRLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztZQUN4QixJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzdCLENBQUM7UUFFTSxRQUFRO1lBQ2IsSUFBSSxRQUFRLEdBQXVDLElBQUksQ0FBQyxhQUFhLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUN6RixPQUFPLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQztRQUMzQixDQUFDO1FBRU0sVUFBVSxDQUFDLFFBQWlCO1lBQ2pDLEtBQUssQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUNqRSxDQUFDO0tBQ0Y7SUF6Q1ksWUFBUyxZQXlDckIsQ0FBQTtJQUVELE1BQWEsTUFBTyxTQUFRLFFBQVE7UUFDbEMsWUFBbUIsUUFBZ0IsUUFBUTtZQUN6QyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDYixJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxXQUFXLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO1lBQzdELElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxPQUFPLENBQUMsYUFBYSxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN2RixJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksT0FBTyxDQUFDLFFBQVEsRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDcEYsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxNQUFNLEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3BGLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxPQUFPLENBQUMsS0FBSyxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNwRixDQUFDO0tBQ0Y7SUFUWSxTQUFNLFNBU2xCLENBQUE7SUFFRCxNQUFhLEtBQU0sU0FBUSxRQUFRO1FBQ2pDLFlBQW1CLFFBQWdCLE9BQU87WUFDeEMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ2IsSUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO1lBQzdCLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNqRCxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDakQsS0FBSyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7UUFDdEMsQ0FBQztLQUNGO0lBUlksUUFBSyxRQVFqQixDQUFBO0lBRUQsTUFBYSxhQUFjLFNBQVEsUUFBUTtRQUN6QyxNQUFNLENBQWU7UUFFckIsWUFBbUIsUUFBZ0IsZUFBZTtZQUNoRCxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDYixJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRSxVQUFVLEVBQUUsQ0FBQyxFQUFFLENBQUM7WUFDOUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUN0QyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM3QixJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUM5QixJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksT0FBTyxDQUFDLFdBQVcsRUFBRSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNwRSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksT0FBTyxDQUFDLFlBQVksRUFBRSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUN2RSxDQUFDO1FBRU0sR0FBRyxDQUFDLE9BQVc7WUFDcEIsSUFBSSxPQUFPLENBQUMsUUFBUSxDQUFDO2dCQUNuQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQzs7Z0JBRW5DLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDdkIsQ0FBQztLQUNGO0lBbkJZLGdCQUFhLGdCQW1CekIsQ0FBQTtJQUVELE1BQWEsY0FBZSxTQUFRLFFBQVE7UUFDMUMsWUFBbUIsUUFBZ0IsZ0JBQWdCO1lBQ2pELEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNiLElBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRSxDQUFDO1lBQ3RELElBQUksTUFBTSxHQUFpQixJQUFJLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNuRCxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3hCLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDekIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMzQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksTUFBTSxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQzlDLENBQUM7UUFFTSxHQUFHO1lBQ1IsS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQ2hDLElBQUksUUFBUSxHQUF1QixLQUFLLENBQUM7Z0JBQ3pDLElBQUksSUFBSSxHQUFXLFFBQVEsQ0FBQyxJQUFJLENBQUM7Z0JBQ2pDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztvQkFDcEIsU0FBUztnQkFDWCxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUNyQyxDQUFDO1lBQ0QsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBQ3JCLENBQUM7UUFFTSxHQUFHLENBQUMsT0FBVztZQUNwQixLQUFLLElBQUksS0FBSyxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFDaEMsSUFBSSxRQUFRLEdBQXVCLEtBQUssQ0FBQztnQkFDekMsSUFBSSxJQUFJLEdBQVcsUUFBUSxDQUFDLElBQUksQ0FBQztnQkFDakMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUM7b0JBQ2hCLFNBQVM7Z0JBQ1gsUUFBUSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUM5QixDQUFDO1FBQ0gsQ0FBQztLQUNGO0lBL0JZLGlCQUFjLGlCQStCMUIsQ0FBQTtJQUVELE1BQWEsR0FBSSxTQUFRLGVBQWU7UUFDdEM7WUFDRSxLQUFLLEVBQUUsQ0FBQztZQUNSLENBQUMsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLHVDQUFxQixJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDM0QsQ0FBQztRQUVNLE1BQU0sR0FBRyxHQUFTLEVBQUU7WUFDekIsSUFBSSxDQUFDLFNBQVMsR0FBRyxPQUFPLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzlELENBQUMsQ0FBQztLQUNIO0lBVFksTUFBRyxNQVNmLENBQUE7SUFFRCxNQUFhLElBQUssU0FBUSxlQUFlO1FBQ3ZDO1lBQ0UsS0FBSyxFQUFFLENBQUM7WUFDUixDQUFDLENBQUMsSUFBSSxDQUFDLGdCQUFnQix1Q0FBcUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzNELENBQUM7UUFFTSxNQUFNLEdBQUcsR0FBUyxFQUFFO1lBQ3pCLElBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUN6QyxDQUFDLENBQUM7UUFFSyxHQUFHLEdBQUcsR0FBVyxFQUFFO1lBQ3hCLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3RDLENBQUMsQ0FBQztLQUNIO0lBYlksT0FBSSxPQWFoQixDQUFBO0lBRUQsY0FBYyxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsT0FBTyxFQUFFLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUM7SUFDbEUsY0FBYyxDQUFDLE1BQU0sQ0FBQyxtQkFBbUIsRUFBRSxjQUFjLEVBQUUsRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFFLENBQUMsQ0FBQztJQUNwRixjQUFjLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxhQUFhLEVBQUUsRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFFLENBQUMsQ0FBQztJQUMxRSxjQUFjLENBQUMsTUFBTSxDQUFDLGNBQWMsRUFBRSxTQUFTLEVBQUUsRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFFLENBQUMsQ0FBQztJQUMxRSxjQUFjLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxNQUFNLEVBQUUsRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFFLENBQUMsQ0FBQztJQUNwRSxjQUFjLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxNQUFNLEVBQUUsRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFFLENBQUMsQ0FBQztJQUNwRSxjQUFjLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxLQUFLLEVBQUUsRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFFLENBQUMsQ0FBQztJQUNsRSxjQUFjLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRSxRQUFRLEVBQUUsRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFFLENBQUMsQ0FBQztJQUN4RSxjQUFjLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQztJQUMxRCxjQUFjLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQztBQUM5RCxDQUFDLEVBek5TLEVBQUUsS0FBRixFQUFFLFFBeU5YIn0=