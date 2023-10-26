import { GUI3DManager, HolographicButton, TextBlock } from '@babylonjs/gui';
import HavokPhysics from '@babylonjs/havok';
import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, MeshBuilder, HavokPlugin, PhysicsAggregate, 
    PhysicsShapeType, Mesh, StandardMaterial, PBRMaterial, Texture, Color3, PhysicsBody, DirectionalLight, Angle, 
    DynamicTexture, Matrix, ActionManager, ExecuteCodeAction } from '@babylonjs/core';
import { Tile } from 'tile';
import { SignalRService } from 'signalr-service';
import { autoinject } from 'aurelia-framework';
import { DynamicTextureService } from 'dynamic-texture-service';
import { Game } from 'game';
import { GameService } from 'game-service';
import { EventAggregator } from 'utils/event-aggregator';
import { Events } from 'utils/events';
import { CheckTileEventData, NewGameStartedEventData } from 'interfaces/event-data';

export interface WallUnit {
    wall: Mesh;
    wallBody: PhysicsBody; // Replace with the appropriate type for wall bodies
}

export interface WallConfig {
    position: Vector3;
    width: number;
    height: number;
    depth: number;
    alpha: number;
}

@autoinject
export class BabylonService {
  private engine: Engine;
  private scene: Scene;
  private camera: ArcRotateCamera;
  private display: HolographicButton;
  private text: TextBlock;
  private tiles: Tile[] = [];
  private selectedTile: Tile | null = null;
  private skybox: Mesh;
  currentGame: Game;

  constructor(private dynamicTextureService: DynamicTextureService, private gameService: GameService) {
    // Initialization logic here
  }

  async initialize(canvas: HTMLCanvasElement, signalRService: SignalRService, eventAggregator: EventAggregator) {
    await this.setupEngineAndScene(canvas);
    await this.setupPhysics();
    this.setupCamera(canvas);
    this.setupLighting();
    this.setupSkybox();
    this.setupWalls();
    this.setupTiles(signalRService);
    this.setupOverlay();
    this.setupCallbacks(eventAggregator);
    eventAggregator.subscribe<NewGameStartedEventData>(Events.NewGameStarted, 'babylon-service', () => {
      this.unflipAll();
    })

    this.engine.runRenderLoop(() => {
        // Update the skybox position to match the camera's position
        this.skybox.position = this.camera.position;
        this.text.text = `${this.gameService.gameState.currentPlayerName()}'s Turn\nOpponent's Word:\n${this.gameService.gameState.getOpponentPlayerState().currentWord}`;
  
        if (this.selectedTile) {
          this.selectedTile.update();
        }

        this.scene.render();
      });

  }

  dispose() {
    this.scene.dispose();
  }

  private setupCallbacks(eventAggregator: EventAggregator)
  {
    eventAggregator.subscribe(Events.CheckTile, 'babylon-service', this.handleCheckTileResponse.bind(this));
  }

  private handleCheckTileResponse(checkTileResponse: CheckTileEventData) {

    if (this.selectedTile && this.selectedTile.letter === checkTileResponse.letter) {
      if (checkTileResponse.occurrences === 0) {
        this.gameService.flipLetter(checkTileResponse.letter);
        this.selectedTile.flip();
      } else {
        let diff = checkTileResponse.occurrences - this.selectedTile.numberOfAsterisks;
        while (diff--) {
          this.addAsteriskToTile(this.selectedTile);
        }
      }
    }
  }

  private setupOverlay()
  {
    // Create the 3D UI manager
    const manager = new GUI3DManager(this.scene);

    // Let's add a button
    this.display = new HolographicButton("down");
    manager.addControl(this.display);
    this.display.position.y = -2;
    this.display.position.x = -5;
    this.display.scaling = new Vector3(2, 2, 2);

    const overlayMaterial = new StandardMaterial("overlay", this.scene);
    overlayMaterial.backFaceCulling = false;
     // Set the diffuse color to Cornflower Blue
    overlayMaterial.diffuseColor = new Color3(0.216, 0.804, 0.745);
    overlayMaterial.specularColor = new Color3(0, 0, 0);

    this.display.mesh.material = overlayMaterial;

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

  private unflipAll() {
    this.tiles.forEach((tile) => {
      tile.unflip();
    });
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
    wall.material = this.dynamicTextureService.toWallMaterial({
      name: "blue-checkered-fabric_base_4k", 
      alpha, 
      width: 2048, 
      height: 1024, 
      flip: false
    }) as StandardMaterial;
    const wallAggregate = new PhysicsAggregate(wall, PhysicsShapeType.BOX, { mass: 0 }, this.scene);
    const wallBody = wallAggregate.body;
    return { wall, wallBody };
  }

  private setupTiles(signalRService: SignalRService) {
    let adjust = 0.3;
    this.setupTile(signalRService, "Q", new Vector3(-2.5 + adjust, 1, 0));
    this.setupTile(signalRService, "W", new Vector3(-2 + adjust, 1, 0));
    this.setupTile(signalRService, "E", new Vector3(-1.5 + adjust, 1, 0));
    this.setupTile(signalRService, "R", new Vector3(-1 + adjust, 1, 0));
    this.setupTile(signalRService, "T", new Vector3(-0.5 + adjust, 1, 0));
    this.setupTile(signalRService, "Y", new Vector3(0 + adjust, 1, 0));
    this.setupTile(signalRService, "U", new Vector3(0.5 + adjust, 1, 0));
    this.setupTile(signalRService, "I", new Vector3(1.0 + adjust, 1, 0));
    this.setupTile(signalRService, "O", new Vector3(1.5 + adjust, 1, 0));
    this.setupTile(signalRService, "P", new Vector3(2 + adjust, 1, 0));

    adjust = 0.0;
    this.setupTile(signalRService, "A", new Vector3(-2 + adjust, 0, 0));
    this.setupTile(signalRService, "S", new Vector3(-1.5 + adjust, 0, 0));
    this.setupTile(signalRService, "D", new Vector3(-1 + adjust, 0, 0));
    this.setupTile(signalRService, "F", new Vector3(-0.5 + adjust, 0, 0));
    this.setupTile(signalRService, "G", new Vector3(0 + adjust, 0, 0));
    this.setupTile(signalRService, "H", new Vector3(0.5 + adjust, 0, 0));
    this.setupTile(signalRService, "J", new Vector3(1.0 + adjust, 0, 0));
    this.setupTile(signalRService, "K", new Vector3(1.5 + adjust, 0, 0));
    this.setupTile(signalRService, "L", new Vector3(2.0 + adjust, 0, 0));

    adjust = 0.0;
    this.setupTile(signalRService, "Z", new Vector3(-1.5 + adjust, -1, 0));
    this.setupTile(signalRService, "X", new Vector3(-1 + adjust, -1, 0));
    this.setupTile(signalRService, "C", new Vector3(-0.5 + adjust, -1, 0));
    this.setupTile(signalRService, "V", new Vector3(0 + adjust, -1, 0));
    this.setupTile(signalRService, "B", new Vector3(0.5 + adjust, -1, 0));
    this.setupTile(signalRService, "N", new Vector3(1.0 + adjust, -1, 0));
    this.setupTile(signalRService, "M", new Vector3(1.5 + adjust, -1, 0));
  }

  private createPBRMaterial(scene: Scene): PBRMaterial {
    const pbrMaterial = new PBRMaterial("pbr", scene);
    pbrMaterial.roughness = 0.3;
    pbrMaterial.emissiveColor = new Color3(0.3922, 0.5843, 0.9294);
    pbrMaterial.emissiveIntensity = 0.9;
    pbrMaterial.alpha = 0.95;
    return pbrMaterial;
  }
  
  private createDynamicTextureWithText(scene: Scene, text: string): DynamicTexture {
    const texture = new DynamicTexture("dynamic texture", { width: 256, height: 256 }, scene);
    const font = "bold 100px monospace";
    texture.drawText(text, 100, 160, font, "black", "white", true, true);
    return texture;
  }
  
  private setupTileActions(box: Mesh, tile: Tile, signalRService: SignalRService, pbrMaterial: PBRMaterial) {
    if (!box.actionManager) {
      box.actionManager = new ActionManager(this.scene);
    }
    box.actionManager.registerAction(
      new ExecuteCodeAction(
        ActionManager.OnPickTrigger,
        () => {
          this.selectedTile = tile;
          if (!this.gameService.gameState.isYourTurn())
          {
            return;
          }
          signalRService.checkTile(tile.letter, this.gameService.gameState.yourPlayerIndex, this.gameService.gameState.gameId);
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
  
  private setupTile(signalRService: SignalRService, text: string, position: Vector3) {
    const pbrMaterial = this.createPBRMaterial(this.scene);
    const box = MeshBuilder.CreateBox("box", { height: 0.5, width: 0.5, depth: 0.1 }, this.scene);
    const texture = this.createDynamicTextureWithText(this.scene, text);
  
    pbrMaterial.emissiveTexture = texture;
    box.setPivotMatrix(Matrix.Translation(0, 0.3, 0));
    box.material = pbrMaterial;
    box.position = position;
  
    const tile = new Tile(text, box);
    this.tiles.push(tile);
  
    this.setupTileActions(box, tile, signalRService, pbrMaterial);
  }  

  private addAsteriskToTile(tile: Tile) {
    // Increment the number of asterisks for this tile
    tile.incrementAsterisks();
  
    // Step 1: Increase the height of the tile
    tile.box.scaling.y += 0.2;
    tile.box.position.y += 0.1;
  
    // Step 2: Create a new plane mesh for the asterisk
    const asteriskPlane = MeshBuilder.CreatePlane("asteriskPlane", { width: 0.2, height: 0.2 }, this.scene);
  
    // Step 3: Create a texture with the asterisk symbol
    const asteriskTexture = new DynamicTexture("asteriskTexture", { width: 128, height: 128 }, this.scene);
    const font = "bold 64px monospace";
    asteriskTexture.drawText("*", 30, 80, font, "black", "white", true, true);
  
    // Create and set material for the asterisk
    const asteriskMaterial = new StandardMaterial("asteriskMat", this.scene);
    asteriskMaterial.diffuseTexture = asteriskTexture;
    asteriskPlane.material = asteriskMaterial;
  
    // Step 4: Position the asterisk at the top of the tile
    const yOffset = 0.5 + 0.1 * tile.numberOfAsterisks;  // Calculate the offset based on the number of asterisks
    asteriskPlane.position = new Vector3(tile.box.position.x, yOffset, tile.box.position.z);
  
    // Step 5: Parent the asterisk to the tile so that they move together
    asteriskPlane.setParent(tile.box);
  }  
}
