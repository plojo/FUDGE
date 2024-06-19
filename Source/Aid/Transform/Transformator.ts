namespace FudgeAid {
  import ƒ = FudgeCore;

  /**
   * Allows to translate, rotate and scale matrices visually by dragging with a pointer. 
   * Installs pointer event listeners on the given {@link ƒ.Viewport}s canvas on construction. 
   * Use {@link addListeners}/{@link removeListeners} to handle the installation manually.
   */
  export class Transformator {
    public readonly viewport: ƒ.Viewport;

    public mode: "translate" | "rotate" | "scale" = "translate";
    public space: "local" | "world" = "world";
    public selected: "x" | "y" | "z";

    #mtxLocal: ƒ.Matrix4x4; // local matrix of the object to be transformed
    #mtxWorld: ƒ.Matrix4x4; // world matrix of the object to be transformed

    #mtxLocalBase: ƒ.Matrix4x4 = ƒ.Matrix4x4.IDENTITY(); // local matrix in a state before a transformation starts
    #mtxWorldBase: ƒ.Matrix4x4 = ƒ.Matrix4x4.IDENTITY(); // world matrix in a state before a transformation starts

    #offset: ƒ.Vector3 = ƒ.Vector3.ZERO(); // offest vector pointing from the world position of the object to where the mouse ray collided with the plane on pointer down
    #direction: ƒ.Vector3 = ƒ.Vector3.ZERO(); // driection vector pointing from the world position of the object to where the mouse ray collides with the plane (pointer move)
    #scaleFactor: number; // current scale factor of the scaling transformation

    #isTransforming: boolean = false;

    #axes = { // eslint-disable-line
      x: () => this.space == "world" ? ƒ.Vector3.X() : this.#mtxWorldBase.right,
      y: () => this.space == "world" ? ƒ.Vector3.Y() : this.#mtxWorldBase.up,
      z: () => this.space == "world" ? ƒ.Vector3.Z() : this.#mtxWorldBase.forward
    };

    #normals = { // eslint-disable-line
      x: () => this.space == "world" ? ƒ.Vector3.Z() : this.#mtxWorldBase.forward,
      y: () => this.space == "world" ? ƒ.Vector3.X() : this.#mtxWorldBase.right,
      z: () => this.space == "world" ? ƒ.Vector3.X() : this.#mtxWorldBase.right
    };

    #normal: ƒ.Vector3 = ƒ.Vector3.ZERO();

    #colors = { // eslint-disable-line
      x: ƒ.Color.CSS("red"),
      y: ƒ.Color.CSS("limegreen"),
      z: ƒ.Color.CSS("blue"),
      origin: ƒ.Color.CSS("dimgray", 0.75)
    };

    #colorsLight = { // eslint-disable-line
      x: ƒ.Color.CSS("salmon"),
      y: ƒ.Color.CSS("lightgreen"),
      z: ƒ.Color.CSS("cornflowerblue")
    };

    #torus: ƒ.MeshTorus;
    #torusPick: ƒ.MeshTorus;

    public constructor(_viewport: ƒ.Viewport) {
      this.viewport = _viewport;
      this.addListeners();
      this.#torus = new ƒ.MeshTorus("Torus", 0.5 - 0.0005, 0.005, 60, 8);
      this.#torusPick = new ƒ.MeshTorus("TorusPick", 0.5 - 0.003, 0.03, 60, 8);
      ƒ.Project.deregister(this.#torus);
      ƒ.Project.deregister(this.#torusPick);
    }

    public set mtxLocal(_mtx: ƒ.Matrix4x4) {
      this.#mtxLocal = _mtx;
      if (this.#mtxLocal)
        this.#mtxLocalBase.copy(_mtx);
    }

    public set mtxWorld(_mtx: ƒ.Matrix4x4) {
      this.#mtxWorld = _mtx;
      if (this.#mtxWorld)
        this.#mtxWorldBase.copy(_mtx);
    }

    private get camera(): ƒ.ComponentCamera {
      return this.viewport.camera;
    }

    public addListeners = (): void => {
      this.viewport.canvas.addEventListener("pointerdown", this.hndPointerDown);
      this.viewport.canvas.addEventListener("pointermove", this.hndPointerMove);
      this.viewport.canvas.addEventListener("pointerup", this.hndPointerUp);
      this.viewport.canvas.addEventListener("pointerleave", this.hndPointerUp);
      this.viewport.canvas.addEventListener("pointercancel", this.hndPointerUp);
      this.viewport.addEventListener(ƒ.EVENT.RENDER_END, this.hndRenderEnd);
    };

    public removeListeners = (): void => {
      this.viewport.canvas.removeEventListener("pointerdown", this.hndPointerDown);
      this.viewport.canvas.removeEventListener("pointermove", this.hndPointerMove);
      this.viewport.canvas.removeEventListener("pointerup", this.hndPointerUp);
      this.viewport.canvas.removeEventListener("pointerleave", this.hndPointerUp);
      this.viewport.canvas.removeEventListener("pointercancel", this.hndPointerUp);
      this.viewport.removeEventListener(ƒ.EVENT.RENDER_END, this.hndRenderEnd);
    };

    public drawGizmos(_cmpCamera: ƒ.ComponentCamera): void {
      if (!this.#mtxLocal || !this.#mtxWorld)
        return;

      const isPicking: boolean = _cmpCamera != this.camera; // if the camera is not the viewports, it must be the picking camera

      let scale: number = _cmpCamera.getWorldToPixelScale(this.#mtxWorld.translation);
      let widthArrow: number = scale * (isPicking ? 10 : 1); // 10 or 1 pixel wide;
      let lengthArrow: number;
      let sizeHead: number;

      if (this.#isTransforming) {
        const mtx: ƒ.Matrix4x4 = ƒ.Matrix4x4.COMPOSITION(this.#mtxWorld.translation);
        const line: ƒ.Vector3[] = [] = [ƒ.Vector3.Z(-1000), ƒ.Vector3.Z(1000)];

        ƒ.Gizmos.drawLines(line, mtx.lookIn(this.#axes[this.selected](), this.#normals[this.selected]()), this.#colorsLight[this.selected], 1);
        ƒ.Recycler.storeMultiple(mtx, line[0], line[1]);
      }

      let clrX: ƒ.Color = this.selected == "x" && !this.#isTransforming ? this.#colorsLight[this.selected] : this.#colors.x;
      let clrY: ƒ.Color = this.selected == "y" && !this.#isTransforming ? this.#colorsLight[this.selected] : this.#colors.y;
      let clrZ: ƒ.Color = this.selected == "z" && !this.#isTransforming ? this.#colorsLight[this.selected] : this.#colors.z;
      switch (this.mode) {
        case "translate":
          lengthArrow = scale * (isPicking ? 90 : 80); // 80 pixels long
          sizeHead = scale * 12; // 12 pixels wide
          ƒ.Gizmos.drawArrow(this.#mtxWorld.translation, clrX, this.#axes.x(), this.#normals.x(), lengthArrow, widthArrow, sizeHead, ƒ.MeshPyramid, 1);
          ƒ.Gizmos.drawArrow(this.#mtxWorld.translation, clrY, this.#axes.y(), this.#normals.y(), lengthArrow, widthArrow, sizeHead, ƒ.MeshPyramid, 1);
          ƒ.Gizmos.drawArrow(this.#mtxWorld.translation, clrZ, this.#axes.z(), this.#normals.z(), lengthArrow, widthArrow, sizeHead, ƒ.MeshPyramid, 1);
          if (this.#isTransforming) {
            let scaleOrigin: number = _cmpCamera.getWorldToPixelScale(this.#mtxWorldBase.translation);
            ƒ.Gizmos.drawArrow(this.#mtxWorldBase.translation, this.#colors.origin, this.#axes[this.selected](), this.#normals[this.selected](), scaleOrigin * 80, scaleOrigin * 1, scaleOrigin * 12, ƒ.MeshPyramid, 1);
          }
          // ƒ.Gizmos.drawArrow(this.mtxWorld.translation, ƒ.Color.CSS("magenta"), this.normal, this.axes[this.selected], lengthArrow, widthArrow, sizeHead, ƒ.MeshPyramid, 1);

          break;
        case "rotate":
          let radius: number = scale * 80; // 80 pixels radius
          sizeHead = scale * 12;

          if (this.#isTransforming) {
            this.drawCircle(this.#torus, this.#colors[this.selected], this.#axes[this.selected](), this.#normals[this.selected](), radius, 1);
            ƒ.Gizmos.drawArrow(this.#mtxWorld.translation, this.#colors.origin, this.#offset, this.#axes[this.selected](), radius, widthArrow, sizeHead, ƒ.MeshPyramid, 1);
            // ƒ.Gizmos.drawArrow(this.mtxWorld.translation, this.colorsLight[this.selected], this.move, this.axes[this.selected], this.move.magnitude, widthArrow, sizeHead, ƒ.MeshPyramid, 1);
            ƒ.Gizmos.drawArrow(this.#mtxWorld.translation, this.#colors[this.selected], this.#direction, this.#axes[this.selected](), radius, widthArrow, sizeHead, ƒ.MeshPyramid, 1);
            break;
          }

          // draw an invisible quad to occlude the tori
          const mtxQuad: ƒ.Matrix4x4 = ƒ.Matrix4x4.COMPOSITION(this.#mtxWorld.translation);
          const direction: ƒ.Vector3 = _cmpCamera.mtxWorld.forward.negate();
          mtxQuad.scaling = ƒ.Vector3.ONE(radius * 2);
          mtxQuad.lookIn(direction);

          ƒ.Render.setDepthFunction(ƒ.DEPTH_FUNCTION.ALWAYS);
          ƒ.Render.setColorWriteMask(false, false, false, false);
          ƒ.Gizmos.drawQuad(mtxQuad, this.#colors.origin); // color doesn't matter
          ƒ.Render.setColorWriteMask(true, true, true, true);
          ƒ.Render.setDepthFunction(ƒ.DEPTH_FUNCTION.LESS);

          // draw the tori
          let torus: ƒ.MeshTorus = isPicking ? this.#torusPick : this.#torus;
          this.drawCircle(torus, clrX, this.#axes.x(), this.#normals.x(), radius, 0);
          this.drawCircle(torus, clrY, this.#axes.y(), this.#normals.y(), radius, 0);
          this.drawCircle(torus, clrZ, this.#axes.z(), this.#normals.z(), radius, 0);

          ƒ.Recycler.storeMultiple(mtxQuad, direction);

          break;
        case "scale":
          lengthArrow = scale * (isPicking ? 84 : 74);
          sizeHead = scale * 6;

          if (this.#isTransforming) {
            // ƒ.Gizmos.drawArrow(this.mtxWorld.translation, this.colorsLight[this.selected], this.direction, this.normals[this.selected], this.direction.magnitude, widthArrow, sizeHead, ƒ.MeshCube, 1);
            ƒ.Gizmos.drawArrow(this.#mtxWorld.translation, this.#colors[this.selected], this.#axes[this.selected](), this.#normals[this.selected](), lengthArrow * this.#scaleFactor, widthArrow, sizeHead, ƒ.MeshCube, 1);
            ƒ.Gizmos.drawArrow(this.#mtxWorld.translation, this.#colors.origin, this.#axes[this.selected](), this.#normals[this.selected](), lengthArrow, widthArrow, sizeHead, ƒ.MeshCube, 1);
            break;
          }

          ƒ.Gizmos.drawArrow(this.#mtxWorld.translation, clrX, this.#axes.x(), this.#normals.x(), lengthArrow, widthArrow, sizeHead, ƒ.MeshCube, 1);
          ƒ.Gizmos.drawArrow(this.#mtxWorld.translation, clrY, this.#axes.y(), this.#normals.y(), lengthArrow, widthArrow, sizeHead, ƒ.MeshCube, 1);
          ƒ.Gizmos.drawArrow(this.#mtxWorld.translation, clrZ, this.#axes.z(), this.#normals.z(), lengthArrow, widthArrow, sizeHead, ƒ.MeshCube, 1);
          break;
      }
    }

    private hndPointerDown = (_event: PointerEvent): void => {
      if (!this.camera || !this.viewport || !this.selected || !this.#mtxLocal || !this.#mtxWorld)
        return;

      this.#mtxLocalBase.copy(this.#mtxLocal);
      this.#mtxWorldBase.copy(this.#mtxWorld);

      const mtxNormal: ƒ.Matrix4x4 = ƒ.Matrix4x4.LOOK_AT(this.#mtxWorld.translation, this.camera.mtxWorld.translation, this.#axes[this.selected](), true);
      this.#normal.copy(mtxNormal.forward); // normal of the plane the mouse ray will collide with

      const point: ƒ.Vector3 = this.getPoint3D(_event);
      this.#offset.copy(point.subtract(this.#mtxWorld.translation));

      ƒ.Recycler.storeMultiple(mtxNormal, point);
    };

    private hndPointerMove = (_event: PointerEvent): void => {
      this.#isTransforming = false;
      this.viewport.canvas.style.cursor = "default";

      if (_event.buttons != 1) {
        const point: ƒ.Vector2 = new ƒ.Vector2(_event.offsetX, _event.offsetY);
        const pick: ƒ.Pick = ƒ.Picker.pickCamera([this], this.camera, this.viewport.pointClientToProjection(point))[0];

        if (pick?.color.r > 0.7)
          this.selected = "x";
        else if (pick?.color.g > 0.7)
          this.selected = "y";
        else if (pick?.color.b > 0.7)
          this.selected = "z";
        else
          this.selected = null;

        if (this.selected)
          this.viewport.canvas.style.cursor = "grab";

        ƒ.Recycler.store(point);

        return;
      }

      if (!this.camera || !this.viewport || !this.selected || !this.#mtxLocal || !this.#mtxWorld)
        return;

      this.#isTransforming = true;
      this.viewport.canvas.style.cursor = "grabbing";

      this.#direction.copy(this.getPoint3D(_event).subtract(this.#mtxWorldBase.translation));
      this.#mtxLocal.copy(this.#mtxLocalBase); // reset

      const axis: ƒ.Vector3 = this.#axes[this.selected]();

      switch (this.mode) {
        case "translate":
          const mtxWorldInvserse: ƒ.Matrix4x4 = this.#mtxWorldBase.clone.invert();
          const translation: ƒ.Vector3 = ƒ.Vector3.PROJECTION(this.#direction, axis);
          const translationOffset: ƒ.Vector3 = ƒ.Vector3.PROJECTION(this.#offset, axis);
          translation.subtract(translationOffset);
          translation.transform(mtxWorldInvserse, false);

          this.#mtxLocal.translate(translation);

          ƒ.Recycler.storeMultiple(mtxWorldInvserse, translation, translationOffset);
          break;
        case "rotate":
          const rotationInverse: ƒ.Quaternion = this.#mtxWorldBase.quaternion.clone.invert();

          // rotate vectors into local space
          const offsetLocal: ƒ.Vector3 = this.#offset.clone.transform(rotationInverse);
          const directionLocal: ƒ.Vector3 = this.#direction.clone.transform(rotationInverse);
          const axisLocal: ƒ.Vector3 = axis.transform(rotationInverse);

          let angle: number = ƒ.Vector3.ANGLE(offsetLocal, directionLocal);

          // Determine the direction of rotation
          const cross: ƒ.Vector3 = ƒ.Vector3.CROSS(offsetLocal, directionLocal);
          if (ƒ.Vector3.DOT(axisLocal, cross) < 0)
            angle = -angle;

          const rotation: ƒ.Quaternion = ƒ.Quaternion.ROTATION(axisLocal, angle);

          this.#mtxLocal.rotate(rotation);

          ƒ.Recycler.storeMultiple(rotationInverse, offsetLocal, directionLocal, axisLocal, cross, rotation);
          break;
        case "scale":
          this.#scaleFactor = Math.sign(ƒ.Vector3.DOT(axis, this.#direction)) * this.#direction.magnitude / this.#offset.magnitude;

          const vctScaling: ƒ.Vector3 = ƒ.Vector3.ONE();
          vctScaling[this.selected] = this.#scaleFactor;

          const mtxScaling: ƒ.Matrix4x4 = ƒ.Matrix4x4.SCALING(vctScaling);

          if (this.space == "world") { // rotationInverse * scaling * rotation
            const rotationInverse: ƒ.Quaternion = this.#mtxWorldBase.quaternion.clone.invert();
            mtxScaling.rotate(rotationInverse, true);
            mtxScaling.rotate(this.#mtxWorldBase.quaternion);
            ƒ.Recycler.store(rotationInverse);
          }

          this.#mtxLocal.scale(mtxScaling.scaling);

          ƒ.Recycler.storeMultiple(vctScaling, mtxScaling);
          break;
      }

    };

    private hndPointerUp = (_event: PointerEvent): void => {
      if (this.#mtxLocal)
        this.#mtxLocalBase.copy(this.#mtxLocal);
      if (this.#mtxWorld)
        this.#mtxWorldBase.copy(this.#mtxWorld);
      if (this.selected)
        this.selected = null;
      if (this.#isTransforming)
        this.#isTransforming = false;
    };

    private hndRenderEnd = (): void => {
      this.drawGizmos(this.viewport.camera);
    };

    private drawCircle(_torus: ƒ.MeshTorus, _color: ƒ.Color, _direction: ƒ.Vector3, _up: ƒ.Vector3, _radius: number, _alphaOccluded: number): void {
      const mtxWorld: ƒ.Matrix4x4 = this.#mtxWorld.clone;
      const vctScaling: ƒ.Vector3 = ƒ.Recycler.reuse(ƒ.Vector3).set(_radius * 2, _radius * 2, _radius * 2);

      mtxWorld.scaling = vctScaling;
      mtxWorld.lookIn(_direction, _up); // lookIn orientates the z-axis but the toruse lays on the xz-plane (facing in y-direction),
      mtxWorld.rotateX(90);             // thus we rotate the torus so the circle faces in _direction
      // ƒ.Gizmos.drawMesh(this.torusPick, mtxWorld, ƒ.Color.CSS("magenta"), _alphaOccluded);
      ƒ.Gizmos.drawMesh(_torus, mtxWorld, _color, _alphaOccluded);

      ƒ.Recycler.storeMultiple(mtxWorld, vctScaling);
    }

    private getPoint3D(_event: PointerEvent): ƒ.Vector3 {
      const point2D: ƒ.Vector2 = ƒ.Recycler.reuse(ƒ.Vector2).set(_event.offsetX, _event.offsetY);
      const ray: ƒ.Ray = this.viewport.getRayFromClient(point2D);
      const normal: ƒ.Vector3 = this.mode == "rotate" ? this.#axes[this.selected]() : this.#normal;

      ƒ.Recycler.store(point2D);
      return ray.intersectPlane(this.#mtxWorldBase.translation, normal);
    }
  }
}