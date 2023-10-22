import { GUI3DManager, HolographicButton, TextBlock } from '@babylonjs/gui';
import HavokPhysics from '@babylonjs/havok';
import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, MeshBuilder, HavokPlugin, PhysicsAggregate, 
    PhysicsShapeType, Mesh, StandardMaterial, PBRMaterial, Texture, Color3, PhysicsBody, DirectionalLight, Angle, 
    DynamicTexture, Matrix, ActionManager, ExecuteCodeAction } from '@babylonjs/core';
import { Tile } from 'tile';
import { SignalRService } from 'signalr-service';
import { autoinject } from 'aurelia-framework';
import { DynamicTextureService } from 'dynamic-texture-service';

export interface WallUnit {
    wall: Mesh;
    wallBody: any; // Replace with the appropriate type for wall bodies
};

export interface WallConfig {
    position: Vector3;
    width: number;
    height: number;
    depth: number;
    alpha: number;
};  

@autoinject
export class BabylonService {
  private engine: Engine;
  private scene: Scene;
  private camera: ArcRotateCamera;
  private display: HolographicButton;
  private text: TextBlock;
  private currentWord: string = "";
  private tiles: Tile[] = [];
  private selectedTile: Tile | null = null;
  private gameId: string;
  private skybox: Mesh;

  constructor(private dynamicTextureService: DynamicTextureService) {
    // Initialization logic here
  }

  async initialize(canvas: HTMLCanvasElement, signalRService: SignalRService, gameId: string, playerName: string, otherPlayerName: string) {
    this.gameId = gameId;
    await this.setupEngineAndScene(canvas);
    await this.setupPhysics();
    this.setupCamera(canvas);
    this.setupLighting();
    this.setupSkybox();
    this.setupWalls();
    this.setupTiles();
    this.setupOverlay();
    this.setupCallbacks(signalRService);
    
    this.engine.runRenderLoop(() => {
        // Update the skybox position to match the camera's position
        this.skybox.position = this.camera.position;
        this.text.text = `Current Word:\n${this.currentWord}`;
  
        if (this.selectedTile) {
          this.selectedTile.update();
        }

        this.scene.render();
      });
  }

  private setupCallbacks(signalRService: SignalRService)
  {
    signalRService.onCheckTileResponse((gameId, letter, occurrences) => {
      if (gameId !== this.gameId) {
        return; // Ignore messages for other games
      }
    
      if (this.selectedTile && this.selectedTile.letter === letter) {
        if (occurrences === 0) {
          this.selectedTile.flip();
        } else {
          this.selectedTile.addAsterisks(occurrences);
        }
      }
    });
  }

  private setupOverlay()
  {
    // Create the 3D UI manager
    var manager = new GUI3DManager(this.scene);

    // Let's add a button
    this.display = new HolographicButton("down");
    manager.addControl(this.display);
    this.display.position.y = -2;
    this.display.position.x = -5;
    this.display.scaling = new Vector3(2, 2, 2);
    this.display.mesh.material = this.dynamicTextureService.toWallMaterial({name: "kloofendal_48d_partly_cloudy_puresky", alpha: 1.0, width: 8192, height: 4096, flip: false});

    this.text = new TextBlock();
    this.text.text = "";
    this.text.color = "White";
    this.text.fontSize = 22;
    this.display.content = this.text;
  }

  private async setupEngineAndScene(canvas: HTMLCanvasElement) {
    this.engine = new Engine(canvas, true);
    this.scene = new Scene(this.engine);
  }

  private async setupPhysics() {
    const havokInstance = await HavokPhysics();
    const havokPlugin = new HavokPlugin(true, havokInstance);
    const gravityVector = new Vector3(0, -9.81, 0);
    const physicsPlugin = havokPlugin;
    this.scene.enablePhysics(gravityVector, physicsPlugin);
  }

  private async setupCamera(canvas: HTMLCanvasElement) {
    this.camera = new ArcRotateCamera('camera1', -Math.PI / 2, Math.PI / 2, 10, Vector3.Zero(), this.scene);
    this.camera.attachControl(canvas, false);
    this.camera.setPosition(new Vector3(0, 1, -10));
    this.camera.upperBetaLimit = Angle.FromDegrees(90).radians();
    this.camera.lowerBetaLimit = Angle.FromDegrees(70).radians();  
    this.camera.upperAlphaLimit = Angle.FromDegrees(-80).radians();
    this.camera.lowerAlphaLimit = Angle.FromDegrees(-100).radians();
  }

  private setupLighting() {
    const light = new HemisphericLight('hemiLight', new Vector3(0, 1, 0), this.scene);
    light.intensity = 0.7;
    light.diffuse = new Color3(1, 1, 1);
    light.specular = new Color3(1, 1, 1);
    light.groundColor = new Color3(0.3, 0.3, 0.3);

    const dir2 = new DirectionalLight('dirLight', new Vector3(1, 1, 0), this.scene);
    dir2.intensity = 0.1;
    dir2.diffuse = new Color3(1, 1, 1);
    dir2.specular = new Color3(1, 1, 1);

    const dir3 = new DirectionalLight('dirLight', new Vector3(1, 1, 0), this.scene);
    dir3.intensity = 0.1;
    dir3.diffuse = new Color3(1, 1, 1);
    dir3.specular = new Color3(1, 1, 1);
  }

  private setupSkybox() {
    const skybox = MeshBuilder.CreateBox("skyBox", { size: 1000 }, this.scene);
    this.skybox = skybox;
    const skyboxMaterial = new StandardMaterial("skyBox", this.scene);
    skyboxMaterial.backFaceCulling = false;
     // Set the diffuse color to Cornflower Blue
    skyboxMaterial.diffuseColor = new Color3(0.3922, 0.5843, 0.9294);
    skyboxMaterial.specularColor = new Color3(0, 0, 0);
    var newMat = this.dynamicTextureService.toWallMaterial({name: "kloofendal_48d_partly_cloudy_puresky", alpha: 1.0, width: 8192, height: 4096, flip: true});
    newMat.backFaceCulling = false;
    newMat.specularColor = new Color3(0, 0, 0);
    skybox.material = newMat;
    skybox.material = skyboxMaterial;
  }

  private setupWalls()
  {
    // Create walls
    const leftWall = this.createWall(new Vector3(-3, -4.5, 0), 0.2, 100, 2, 0.8);
    const rightWall = this.createWall(new Vector3(3, -4.5, 0), 0.2, 100, 2, 0.8);
    const zWall1 = this.createWall(new Vector3(0, 45, 0.2), 6, 100, 0.1, 0.2);
  }

  private createWall(position: Vector3, width: number, height: number, depth: number, alpha: number): WallUnit {
    const wall = MeshBuilder.CreateBox("wall", { width, height, depth }, this.scene);
    wall.position = position;

    // const wallMaterial = new StandardMaterial("wallMaterial", this.scene);
    // const stoneTexture = new Texture("/textures/sandstone-brick_base_4k.jpg", this.scene);
    // wallMaterial.diffuseTexture = stoneTexture;
    // wallMaterial.diffuseColor = new Color3(0.749, 0.651, 0.454);
    // wallMaterial.emissiveColor = new Color3(0.3922, 0.5843, 0.9294);
    // wallMaterial.useEmissiveAsIllumination = true;
    // wallMaterial.alpha = alpha;
    // wall.material = wallMaterial;

    wall.material = this.dynamicTextureService.toWallMaterial({name: "sandstone-brick_base_4k", alpha, width: 1024, height: 512, flip: false});
  
    const wallAggregate = new PhysicsAggregate(wall, PhysicsShapeType.BOX, { mass: 0 }, this.scene);
    const wallBody = wallAggregate.body;
    return { wall, wallBody };
  }

  private setupTiles() {
    let adjust = 0.3;
    this.setupTile("Q", new Vector3(-2.5 + adjust, 1, 0));
    this.setupTile("W", new Vector3(-2 + adjust, 1, 0));
    this.setupTile("E", new Vector3(-1.5 + adjust, 1, 0));
    this.setupTile("R", new Vector3(-1 + adjust, 1, 0));
    this.setupTile("T", new Vector3(-0.5 + adjust, 1, 0));
    this.setupTile("Y", new Vector3(0 + adjust, 1, 0));
    this.setupTile("U", new Vector3(0.5 + adjust, 1, 0));
    this.setupTile("I", new Vector3(1.0 + adjust, 1, 0));
    this.setupTile("O", new Vector3(1.5 + adjust, 1, 0));
    this.setupTile("P", new Vector3(2 + adjust, 1, 0));

    adjust = 0.0;
    this.setupTile("A", new Vector3(-2 + adjust, 0, 0));
    this.setupTile("S", new Vector3(-1.5 + adjust, 0, 0));
    this.setupTile("D", new Vector3(-1 + adjust, 0, 0));
    this.setupTile("F", new Vector3(-0.5 + adjust, 0, 0));
    this.setupTile("G", new Vector3(0 + adjust, 0, 0));
    this.setupTile("H", new Vector3(0.5 + adjust, 0, 0));
    this.setupTile("J", new Vector3(1.0 + adjust, 0, 0));
    this.setupTile("K", new Vector3(1.5 + adjust, 0, 0));
    this.setupTile("L", new Vector3(2.0 + adjust, 0, 0));

    adjust = 0.0;
    this.setupTile("Z", new Vector3(-1.5 + adjust, -1, 0));
    this.setupTile("X", new Vector3(-1 + adjust, -1, 0));
    this.setupTile("C", new Vector3(-0.5 + adjust, -1, 0));
    this.setupTile("V", new Vector3(0 + adjust, -1, 0));
    this.setupTile("B", new Vector3(0.5 + adjust, -1, 0));
    this.setupTile("N", new Vector3(1.0 + adjust, -1, 0));
    this.setupTile("M", new Vector3(1.5 + adjust, -1, 0));
  }

  private setupTile(text: string, position: Vector3) {
    var pbrMaterial = new PBRMaterial("pbr", this.scene);
    pbrMaterial.roughness = 0.3; // Value between 0 and 1 to control roughness
    pbrMaterial.emissiveColor =  new Color3(0.3922, 0.5843, 0.9294);
    pbrMaterial.emissiveIntensity = 0.9;
    pbrMaterial.alpha = 0.95;

    // Create box (tile)
    var box = MeshBuilder.CreateBox("box", { height: 0.5, width: 0.5, depth: 0.1 }, this.scene);

    // Create dynamic texture
    var texture = new DynamicTexture("dynamic texture", { width: 256, height: 256 }, this.scene);
    pbrMaterial.emissiveTexture = texture;

    // Draw text on the texture
    var font = "bold 100px monospace";
    texture.drawText(text, 100, 160, font, "black", "white", true, true);

    // Set the pivot point to the bottom of the box
    box.setPivotMatrix(Matrix.Translation(0, 0.3, 0));

    box.material = pbrMaterial;
    box.position = position;
  
    const tile = new Tile(text, box);
    this.tiles.push(tile);

    // Create and assign an action manager if it doesn't exist
    if (!box.actionManager) {
      box.actionManager = new ActionManager(this.scene);
    }
    
    box.actionManager.registerAction(
      new ExecuteCodeAction(
        ActionManager.OnPickTrigger,
        () => {
          this.selectedTile = tile;
          tile.flip();
        }
      )
    );

    // Register pointer over event to light up the tile
    box.actionManager.registerAction(
      new ExecuteCodeAction(
        ActionManager.OnPointerOverTrigger,
        () => {
          // Change the emissive color or intensity to make it look "lit"
          pbrMaterial.emissiveIntensity = 1.5;
        }
      )
    );

    // Register pointer out event to revert the tile to normal
    box.actionManager.registerAction(
      new ExecuteCodeAction(
        ActionManager.OnPointerOutTrigger,
        () => {
          // Revert the emissive color or intensity
          pbrMaterial.emissiveColor = new Color3(0.3922, 0.5843, 0.9294); // Your original color
          pbrMaterial.emissiveIntensity = 0.9; // Your original intensity
        }
      )
    );
  }
}
