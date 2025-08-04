(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))a(i);new MutationObserver(i=>{for(const n of i)if(n.type==="childList")for(const s of n.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&a(s)}).observe(document,{childList:!0,subtree:!0});function t(i){const n={};return i.integrity&&(n.integrity=i.integrity),i.referrerPolicy&&(n.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?n.credentials="include":i.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function a(i){if(i.ep)return;i.ep=!0;const n=t(i);fetch(i.href,n)}})();class U{async init(){throw new Error("El método init() debe ser implementado por la subclase")}update(e){throw new Error("El método update() debe ser implementado por la subclase")}cleanup(){throw new Error("El método cleanup() debe ser implementado por la subclase")}getState(){throw new Error("El método getState() debe ser implementado por la subclase")}setState(e){throw new Error("El método setState() debe ser implementado por la subclase")}}class y extends U{constructor(e,t={}){super(),this.name=e,this.config={autoStart:!1,enableLogging:!0,logLevel:"info",...t},this.isInitialized=!1,this.isRunning=!1,this.lastError=null,this.state={},this.eventListeners=new Map,this.metrics={startTime:null,updateCount:0,errorCount:0,lastUpdateTime:null},this.log("info",`Manager ${this.name} creado`)}async init(){if(this.isInitialized){this.log("warn",`Manager ${this.name} ya inicializado`);return}try{this.log("info",`Inicializando manager ${this.name}...`),this.metrics.startTime=Date.now(),await this.initializeSpecific(),this.isInitialized=!0,this.config.autoStart&&this.start(),this.log("info",`Manager ${this.name} inicializado correctamente`),this.emit("initialized")}catch(e){throw this.handleError("Error en inicialización",e),e}}async initializeSpecific(){}update(e){if(!(!this.isInitialized||!this.isRunning))try{this.metrics.updateCount++,this.metrics.lastUpdateTime=Date.now(),this.updateSpecific(e)}catch(t){this.handleError("Error en update",t)}}updateSpecific(e){}start(){return this.isInitialized?this.isRunning?(this.log("warn",`Manager ${this.name} ya está en ejecución`),!1):(this.isRunning=!0,this.log("info",`Manager ${this.name} iniciado`),this.emit("started"),!0):(this.log("warn",`Intentando iniciar manager ${this.name} no inicializado`),!1)}stop(){return this.isRunning?(this.isRunning=!1,this.log("info",`Manager ${this.name} detenido`),this.emit("stopped"),!0):(this.log("warn",`Manager ${this.name} ya está detenido`),!1)}cleanup(){this.log("info",`Limpiando recursos de manager ${this.name}...`),this.isRunning&&this.stop(),this.eventListeners.clear(),this.cleanupSpecific(),this.isInitialized=!1,this.state={},this.lastError=null,this.log("info",`Manager ${this.name} limpiado`),this.emit("cleaned")}cleanupSpecific(){}getState(){return{name:this.name,isInitialized:this.isInitialized,isRunning:this.isRunning,metrics:{...this.metrics},lastError:this.lastError,state:{...this.state}}}setState(e){const t={...this.state};this.state={...this.state,...e},this.emit("stateChanged",{previous:t,current:this.state}),this.log("debug",`Estado actualizado en manager ${this.name}`)}on(e,t){this.eventListeners.has(e)||this.eventListeners.set(e,[]),this.eventListeners.get(e).push(t)}emit(e,t=null){this.eventListeners.has(e)&&this.eventListeners.get(e).forEach(a=>{try{a(t)}catch(i){this.log("error",`Error en callback de evento ${e}:`,i)}})}off(e,t){if(this.eventListeners.has(e)){const a=this.eventListeners.get(e),i=a.indexOf(t);i!==-1&&a.splice(i,1)}}handleError(e,t){this.metrics.errorCount++,this.lastError={context:e,error:t.message||t,timestamp:Date.now()},this.log("error",`${e} en manager ${this.name}:`,t),this.emit("error",this.lastError)}log(e,t,...a){if(!this.config.enableLogging)return;const i=["debug","info","warn","error"],n=i.indexOf(this.config.logLevel);if(i.indexOf(e)>=n){const o=`[${new Date().toISOString()}] [${this.name}] [${e.toUpperCase()}]`;console[e](o,t,...a)}}getMetrics(){return{...this.metrics,uptime:this.metrics.startTime?Date.now()-this.metrics.startTime:0,updatesPerSecond:this.calculateUpdatesPerSecond()}}calculateUpdatesPerSecond(){if(!this.metrics.startTime||this.metrics.updateCount===0)return 0;const e=Date.now()-this.metrics.startTime;return this.metrics.updateCount/e*1e3}resetMetrics(){this.metrics={startTime:this.isInitialized?Date.now():null,updateCount:0,errorCount:0,lastUpdateTime:null},this.log("info",`Métricas de manager ${this.name} reseteadas`)}}class S{constructor(){this.timer=99,this.status="playing",this.round=1,this.maxRounds=3,this.scores={p1:0,p2:0},this.winner=null,this.winReason=null,this.winnerName=null,this.roundStartTime=null,this.roundEndTime=null,this.roundResult=null,this.isNewRound=!0,this.characters=[],this.gameConfig={roundDuration:99,winCondition:"best-of-3",roundStartDelay:3,roundEndDelay:3}}addCharacter(e){return e?this.characters.length>=2?(console.warn("⚠️ No se pueden agregar más de 2 personajes"),!1):(this.characters.push(e),console.log(`✅ Personaje ${e.name} agregado al GameState`),!0):(console.warn("⚠️ Intento de agregar personaje nulo o indefinido"),!1)}update(e){this.status==="playing"&&(this.updateTimer(e),this.updateCharacters(e),this.detectCollisions(),this.checkVictoryConditions())}updateTimer(e){this.status==="playing"&&(this.timer-=e,this.timer=Math.max(0,this.timer))}updateCharacters(e){Math.random()<.01&&console.log(`🎮 GameState.updateCharacters: ${this.characters.length} personajes, deltaTime=${e.toFixed(4)}s`),this.characters.forEach((t,a)=>{const i=this.characters[1-a];t.update(e,i)})}determineWinnerByHealth(){if(this.characters.length<2)return null;const e=this.characters[0].health,t=this.characters[1].health;return e>t?"p1":t>e?"p2":null}awardRoundWin(e,t="ko"){e==="p1"?(this.scores.p1++,this.winner="p1",this.winnerName=this.characters[0]?.name||"Player 1"):e==="p2"&&(this.scores.p2++,this.winner="p2",this.winnerName=this.characters[1]?.name||"Player 2"),this.winReason=t}checkVictoryConditions(){this.status==="playing"&&(Math.random()<.02&&console.log(`🎯 CheckVictory - Timer: ${this.timer.toFixed(1)}s, P1HP: ${this.characters[0]?.health||0}, P2HP: ${this.characters[1]?.health||0}`),this.checkTimeoutConditions(),this.checkKOConditions(),this.checkMatchVictory())}checkTimeoutConditions(){if(this.timer<=0&&this.status==="playing"){if(console.log("⏰ TIMEOUT DETECTADO - Timer:",this.timer),this.characters.length<2)return;const e=this.characters[0],t=this.characters[1];console.log(`⏰ Vida P1: ${e.health}, Vida P2: ${t.health}`),e.health>t.health?this.endRound("p1","TIMEOUT"):t.health>e.health?this.endRound("p2","TIMEOUT"):this.endRound("draw","TIMEOUT - EMPATE")}}checkKOConditions(){if(this.characters.length<2||this.status!=="playing")return;const e=this.characters[0],t=this.characters[1];e.health<=0?(console.log("💀 KO DETECTADO - P1 derrotado"),this.endRound("p2","KO")):t.health<=0&&(console.log("💀 KO DETECTADO - P2 derrotado"),this.endRound("p1","KO"))}checkMatchVictory(){const e=Math.ceil(this.maxRounds/2);this.scores.p1>=e?(console.log("🏆 MATCH TERMINADO - P1 es el ganador del match"),this.status="gameOver",this.winner="p1",this.winnerName=this.characters[0]?.name||"Player 1",this.winReason="match",console.log("🎉 P1 gana el match")):this.scores.p2>=e&&(console.log("🏆 MATCH TERMINADO - P2 es el ganador del match"),this.status="gameOver",this.winner="p2",this.winnerName=this.characters[1]?.name||"Player 2",this.winReason="match",console.log("🎉 P2 gana el match"))}resetRound(){this.timer=this.gameConfig.roundDuration,this.status="playing",this.round++,this.characters.forEach(e=>{e.health=e.maxHealth,e.superMeter=0,e.changeState("idle")}),console.log(`🔄 Nueva ronda ${this.round} iniciada`)}startNewRound(){this.isNewRound=!0,this.roundStartTime=Date.now(),this.status="roundStart",this.timer=this.gameConfig.roundDuration,this.characters.forEach(e=>{e.reset()}),console.log(`🎯 INICIANDO RONDA ${this.round} - Preparación...`),setTimeout(()=>{this.status==="roundStart"&&(this.status="playing",this.isNewRound=!1,console.log(`🎮 RONDA ${this.round} - ¡LUCHA!`))},this.gameConfig.roundStartDelay*1e3)}endRound(e,t){this.status="roundOver",this.roundEndTime=Date.now(),this.roundResult=e,e==="p1"?(this.scores.p1++,console.log(`🏆 RONDA ${this.round} - ${this.characters[0]?.name||"P1"} GANA por ${t}`)):e==="p2"?(this.scores.p2++,console.log(`🏆 RONDA ${this.round} - ${this.characters[1]?.name||"P2"} GANA por ${t}`)):console.log(`🤝 RONDA ${this.round} - EMPATE por ${t}`);const a=Math.ceil(this.maxRounds/2);this.scores.p1>=a||this.scores.p2>=a?this.endMatch():setTimeout(()=>{this.round++,this.startNewRound()},this.gameConfig.roundEndDelay*1e3)}endMatch(){this.status="gameOver",this.scores.p1>this.scores.p2?(this.winner="p1",this.winnerName=this.characters[0]?.name||"Player 1"):this.scores.p2>this.scores.p1?(this.winner="p2",this.winnerName=this.characters[1]?.name||"Player 2"):(this.winner="draw",this.winnerName="EMPATE"),this.winReason="match",console.log(`🎉 MATCH TERMINADO - ${this.winnerName} gana el match ${this.scores.p1}-${this.scores.p2}`)}getStatusText(){switch(this.status){case"roundStart":return`RONDA ${this.round}`;case"playing":return"LUCHA";case"roundOver":return this.roundResult==="p1"?`${this.characters[0]?.name||"P1"} GANA LA RONDA`:this.roundResult==="p2"?`${this.characters[1]?.name||"P2"} GANA LA RONDA`:"RONDA EMPATADA";case"gameOver":return`${this.winnerName} GANA EL MATCH`;case"paused":return"PAUSADO";default:return""}}resetMatch(){this.timer=this.gameConfig.roundDuration,this.status="playing",this.round=1,this.scores={p1:0,p2:0},this.characters.forEach(e=>{e.reset()}),console.log("🆕 Match reiniciado")}pauseGame(){this.status==="playing"&&(this.status="paused",console.log("⏸️ Juego pausado"))}resumeGame(){this.status==="paused"&&(this.status="playing",console.log("▶️ Juego reanudado"))}getWinner(){return this.status!=="gameOver"?null:this.scores.p1>this.scores.p2?"p1":this.scores.p2>this.scores.p1?"p2":"draw"}getState(){return{timer:this.timer,status:this.status,round:this.round,maxRounds:this.maxRounds,scores:{...this.scores},characterCount:this.characters.length}}isActive(){return this.status==="playing"}isRoundOver(){return this.status==="roundOver"}isGameOver(){return this.status==="gameOver"}detectCollisions(){if(this.characters.length<2)return;const[e,t]=this.characters;this.checkAttackCollisions(e,t),this.checkAttackCollisions(t,e)}checkAttackCollisions(e,t){if(!this.isAttackingState(e.state))return;const a=this.getActiveHitbox(e);if(!a||e.attackHasHit)return;const i=e.position.x+(e.isFlipped?-a.x-a.w:a.x),n=e.position.y+a.y;this.isColliding(i,n,a.w,a.h,t.position.x,t.position.y,64,96)&&this.applyHit(e,t,a)}isAttackingState(e){return["lightPunch","heavyPunch","hadoken","shoryuken"].includes(e)}getActiveHitbox(e){const t=e.animations[e.state];if(!t||!t.frames)return null;const a=t.frames[e.currentFrameIndex];return!a||a.type!=="active"?null:a.hitbox||null}isColliding(e,t,a,i,n,s,r,o){return!(e>n+r||e+a<n||t>s+o||t+i<s)}applyHit(e,t,a){console.log(`💥 ${e.name} golpea a ${t.name} por ${a.damage} daño!`),t.health-=a.damage,t.health<0&&(t.health=0),e.attackHasHit=!0,e.superMeter+=e.stats.superMeterGainOnHit||10,t.superMeter+=e.stats.superMeterGainOnTakeDamage||7,e.superMeter>e.maxSuperMeter&&(e.superMeter=e.maxSuperMeter),t.superMeter>t.maxSuperMeter&&(t.superMeter=t.maxSuperMeter),this.triggerHitEffects(t.position.x,t.position.y),console.log(`💖 ${t.name} vida: ${t.health}/${t.maxHealth}`)}triggerHitEffects(e,t){typeof window<"u"&&window.juiceManager&&(window.juiceManager.triggerHitStop(3),window.juiceManager.triggerScreenShake(8,150),window.juiceManager.createParticles({x:e+32,y:t+48,count:6,color:"orange",life:20,speed:120}))}serialize(){return JSON.stringify({timer:this.timer,status:this.status,round:this.round,maxRounds:this.maxRounds,scores:{...this.scores},characters:this.characters.map(e=>({id:e.id,name:e.name,position:{...e.position},velocity:{...e.velocity},health:e.health,maxHealth:e.maxHealth,superMeter:e.superMeter,state:e.state,currentFrameIndex:e.currentFrameIndex,frameTimer:e.frameTimer,isGrounded:e.isGrounded,isFlipped:e.isFlipped,isFacingRight:e.isFacingRight,attackHasHit:e.attackHasHit}))})}static deserialize(e){const t=typeof e=="string"?JSON.parse(e):e,a=new S;return a.timer=t.timer||99,a.status=t.status||"playing",a.round=t.round||1,a.maxRounds=t.maxRounds||3,a.scores=t.scores||{p1:0,p2:0},a.characters=(t.characters||[]).map(i=>Object.assign({},i)),a}}class V extends y{constructor(e=null,t={},a=null){super("GameManager",{autoStart:!1,enableRollback:!0,autoSaveState:!0,logVictories:!0,tickRate:60,maxHistoryFrames:180,...t}),this.gameState=new S,this.apiClient=e,this.juiceManager=a,this.performanceMonitor=null,this.sceneManager=null,this.battleSceneRef=null,this.rollbackSystem={stateHistory:new Map,currentFrame:0,maxHistoryFrames:this.config.maxHistoryFrames,tickRate:this.config.tickRate}}async initializeSpecific(){this.log("info","Inicializando GameManager con arquitectura SOLID"),await this.initializeSubsystems(),this.setupEventListeners()}async initializeSubsystems(){try{typeof this.juiceManager.init=="function"&&(await this.juiceManager.init(),this.log("debug","JuiceManager inicializado")),typeof this.gameState.init=="function"&&(await this.gameState.init(),this.log("debug","GameState inicializado"))}catch(e){this.handleError("Error al inicializar subsistemas",e)}}setupEventListeners(){this.on("roundEnd",this.handleRoundEnd.bind(this)),this.on("gameEnd",this.handleGameEnd.bind(this)),this.on("characterDefeated",this.handleCharacterDefeated.bind(this))}setPerformanceMonitor(e){this.performanceMonitor=e,console.log("📊 PerformanceMonitor inyectado en GameManager")}setSceneManager(e){this.sceneManager=e,console.log("🎬 SceneManager inyectado en GameManager")}registerBattleScene(e){this.battleSceneRef=e,console.log("🔗 BattleScene registrada en GameManager v2.0")}unregisterBattleScene(){this.battleSceneRef=null,console.log("🔗 BattleScene desregistrada del GameManager")}startGame(){if(this.isRunning){console.warn("⚠️ GameManager ya está corriendo");return}this.isRunning=!0,this.rollbackSystem.currentFrame=0,this.rollbackSystem.stateHistory.clear(),this.gameState&&typeof this.gameState.startNewRound=="function"&&(console.log("🎯 Iniciando primera ronda..."),this.gameState.startNewRound()),console.log("🎮 GameManager v2.0 iniciado (gestión de estado del dominio)")}updateGameState(e){this.isRunning&&(Math.random()<.005&&console.log(`🎮 GameManager.updateGameState: deltaTime=${e.toFixed(4)}s, characters=${this.gameState.characters.length}`),JuiceManager.isHitStopActive()||(this.gameState.update(e),this.config.enableRollback&&this.handleRollbackState(),this.handleGameStateEvents()))}handleGameStateEvents(){this.gameState.isRoundOver()&&this.handleRoundEnd(),this.gameState.isGameOver()&&this.handleMatchEnd()}handleRoundEnd(){if(console.log("🏁 Fin de ronda detectado"),setTimeout(()=>{this.gameState.isGameOver()?this.handleMatchEnd():(console.log("🔄 Reiniciando nueva ronda..."),this.gameState.resetRound())},3e3),this.battleSceneRef&&typeof this.battleSceneRef.onRoundReset=="function"&&this.battleSceneRef.onRoundReset(),this.config.logVictories){const e=this.gameState.getState();console.log(`📊 Ronda ${e.round-1} - Puntuación: P1:${e.scores.p1} P2:${e.scores.p2}`)}}handleMatchEnd(){const e=this.gameState.getWinner();console.log(`🏆 Match terminado - Ganador: ${e||"Empate"}`),this.stopGame();const t={winner:this.gameState.winner,winnerName:this.gameState.winnerName,winReason:this.gameState.winReason,scores:{...this.gameState.scores},p1Name:this.gameState.characters[0]?.name||"Player 1",p2Name:this.gameState.characters[1]?.name||"Player 2"};console.log("🎉 Datos de victoria preparados:",t),setTimeout(()=>{console.log("🎉 Iniciando transición a VictoryScene..."),this.sceneManager&&this.sceneManager.scenes&&this.sceneManager.scenes.has("victory")?(console.log("✅ SceneManager y VictoryScene disponibles, transicionando..."),this.sceneManager.transitionTo("victory",t)):(console.warn("⚠️ SceneManager no disponible, usando fallback"),this.showVictoryScreenDirectly(t))},2e3),this.battleSceneRef&&typeof this.battleSceneRef.onMatchEnd=="function"&&this.battleSceneRef.onMatchEnd(e)}showVictoryScreenDirectly(e){console.log("🎉 Mostrando pantalla de victoria directamente");const t=document.getElementById("gameCanvas");if(t){const s=t.getContext("2d");s.fillStyle="#000015",s.fillRect(0,0,t.width,t.height)}const a=document.createElement("div");a.id="victoryOverlay",a.style.cssText=`
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #0f0f23 0%, #2d1b69 50%, #0f0f23 100%);
            color: white;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            font-family: Arial, sans-serif;
        `;let i="",n="#ffdd00";e.winner==="draw"?(i="¡EMPATE!",n="#ffaa00"):i="¡VICTORIA!",a.innerHTML=`
            <h1 style="font-size: 72px; margin: 0; color: ${n}; text-shadow: 3px 3px 0 #000;">${i}</h1>
            ${e.winner!=="draw"?`
                <h2 style="font-size: 48px; margin: 20px 0; color: #ffffff;">${e.winnerName}</h2>
                <p style="font-size: 24px; margin: 10px 0; color: #cccccc;">${this.getWinReasonText(e.winReason)}</p>
            `:`
                <h2 style="font-size: 36px; margin: 20px 0; color: #ffffff;">Tiempo Agotado</h2>
                <p style="font-size: 24px; margin: 10px 0; color: #cccccc;">Misma cantidad de vida</p>
            `}
            
            <div style="margin: 40px 0; text-align: center;">
                <h3 style="font-size: 32px; margin-bottom: 20px; color: #ffffff;">PUNTUACIÓN</h3>
                <p style="font-size: 28px; color: #dddddd;">
                    ${e.p1Name}: ${e.scores.p1} VS ${e.scores.p2} :${e.p2Name}
                </p>
            </div>
            
            <div style="margin-top: 60px;">
                <button id="rematchBtn" style="
                    background: #4CAF50;
                    color: white;
                    border: none;
                    padding: 15px 30px;
                    margin: 10px;
                    border-radius: 8px;
                    font-size: 20px;
                    cursor: pointer;
                    transition: background 0.3s;
                " onmouseover="this.style.background='#45a049'" onmouseout="this.style.background='#4CAF50'">
                    🔄 Nueva Batalla
                </button>
                <button id="menuBtn" style="
                    background: #2196F3;
                    color: white;
                    border: none;
                    padding: 15px 30px;
                    margin: 10px;
                    border-radius: 8px;
                    font-size: 20px;
                    cursor: pointer;
                    transition: background 0.3s;
                " onmouseover="this.style.background='#1976D2'" onmouseout="this.style.background='#2196F3'">
                    🏠 Menú Principal
                </button>
            </div>
            
            <p style="position: absolute; bottom: 30px; color: #888; font-size: 16px;">
                Presiona los botones o usa las teclas R (rematch) / M (menú)
            </p>
        `,document.body.appendChild(a),this.setupVictoryEvents(a)}getWinReasonText(e){switch(e){case"ko":return"Victoria por K.O.";case"timeout":return"Victoria por Tiempo";case"match":return"Victoria del Match";default:return"Victoria"}}setupVictoryEvents(e){const t=e.querySelector("#rematchBtn"),a=e.querySelector("#menuBtn");t.addEventListener("click",()=>{this.handleVictoryChoice("rematch"),e.remove()}),a.addEventListener("click",()=>{this.handleVictoryChoice("menu"),e.remove()});const i=n=>{n.key.toLowerCase()==="r"?(this.handleVictoryChoice("rematch"),e.remove(),document.removeEventListener("keydown",i)):n.key.toLowerCase()==="m"&&(this.handleVictoryChoice("menu"),e.remove(),document.removeEventListener("keydown",i))};document.addEventListener("keydown",i)}handleVictoryChoice(e){console.log(`🎮 Usuario eligió: ${e}`),(e==="rematch"||e==="menu")&&location.reload()}handleRollbackState(){this.rollbackSystem.currentFrame++,this.rollbackSystem.currentFrame%2===0&&this.saveStateForRollback()}addCharacterToGameState(e){return this.gameState.addCharacter(e)}getCharacters(){return this.gameState.characters}getGameState(){return this.gameState}pauseGame(){this.gameState.pauseGame(),console.log("⏸️ Juego pausado por GameManager")}resumeGame(){this.gameState.resumeGame(),console.log("▶️ Juego reanudado por GameManager")}resetRound(){this.gameState.resetRound(),this.rollbackSystem.stateHistory.clear(),this.rollbackSystem.currentFrame=0,this.battleSceneRef&&typeof this.battleSceneRef.onRoundReset=="function"&&this.battleSceneRef.onRoundReset(),console.log("🔄 Ronda reiniciada por GameManager")}resetMatch(){this.gameState.resetMatch(),this.rollbackSystem.stateHistory.clear(),this.rollbackSystem.currentFrame=0,this.battleSceneRef&&typeof this.battleSceneRef.onMatchReset=="function"&&this.battleSceneRef.onMatchReset(),console.log("🆕 Match reiniciado por GameManager")}saveStateForRollback(){try{const e=this.rollbackSystem.currentFrame,t=this.gameState.serialize();this.rollbackSystem.stateHistory.set(e,t),this.cleanupOldStates()}catch(e){console.warn("⚠️ Error guardando estado para rollback:",e)}}cleanupOldStates(){const e=this.rollbackSystem.maxHistoryFrames;if(this.rollbackSystem.stateHistory.size>e){const t=this.rollbackSystem.currentFrame-e;this.rollbackSystem.stateHistory.delete(t)}}rollbackToFrame(e,t=null){if(!this.rollbackSystem.stateHistory.has(e))return console.warn(`⚠️ No se puede hacer rollback al frame ${e}`),!1;try{const a=this.rollbackSystem.stateHistory.get(e);return this.gameState=S.deserialize(a),t&&this.resimulateFrames(e,t),!0}catch(a){return console.error("❌ Error durante rollback:",a),!1}}resimulateFrames(e,t){const i=1/this.rollbackSystem.tickRate;for(let n=e+1;n<=this.rollbackSystem.currentFrame;n++)this.gameState.update(i)}stopGame(){this.isRunning&&(this.isRunning=!1,this.rollbackSystem.stateHistory.clear(),this.rollbackSystem.currentFrame=0,this.unregisterBattleScene(),console.log("🛑 GameManager v2.0 detenido"))}checkGameOver(){const e=this.gameState.getWinner();return e?(this.stopGame(),console.log(`🏆 Ganador detectado: ${e}`),e):null}sendMetricsUpdate(){if(this.performanceMonitor)try{const e={currentFrame:this.rollbackSystem.currentFrame,gameTime:this.gameState.timer,p1Health:this.gameState.player1?.health||0,p2Health:this.gameState.player2?.health||0,gameStatus:this.gameState.status};this.performanceMonitor.recordFrame(e)}catch(e){console.warn("⚠️ Error enviando métricas:",e)}}setGameSpeed(e=1){this.rollbackSystem.tickRate=60*e,console.log(`⚙️ Velocidad del juego ajustada: ${e}x`)}getGameStats(){return{isRunning:this.isRunning,currentFrame:this.rollbackSystem.currentFrame,tickRate:this.rollbackSystem.tickRate,stateHistorySize:this.rollbackSystem.stateHistory.size,gameTimer:this.gameState.timer,gameStatus:this.gameState.status,player1Health:this.gameState.player1?.health||0,player2Health:this.gameState.player2?.health||0,memoryUsage:this.rollbackSystem.stateHistory.size*512}}getAPIForBattleScene(){return{updateGameState:e=>this.updateGameState(e),getGameState:()=>this.getGameState(),pauseGame:()=>this.pauseGame(),resumeGame:()=>this.resumeGame(),resetRound:()=>this.resetRound(),resetMatch:()=>this.resetMatch(),checkGameOver:()=>this.checkGameOver(),getStats:()=>this.getGameStats(),addCharacter:e=>this.addCharacterToGameState(e),getCharacters:()=>this.getCharacters()}}destroy(){this.stopGame(),this.battleSceneRef=null,this.gameState=null,this.performanceMonitor=null,this.rollbackSystem&&(this.rollbackSystem.stateHistory.clear(),this.rollbackSystem=null),console.log("🗑️ GameManager destruido completamente")}}class q extends y{constructor(e={}){super("SceneManager",{autoStart:!1,transitionDuration:300,enablePreloading:!0,enableCaching:!1,maxHistorySize:5,...e}),this.scenes=new Map,this.sceneInstances=new Map,this.currentScene=null,this.isTransitioning=!1,this.transitionData=null,this.sceneHistory=[]}async initializeSpecific(){this.log("info","Inicializando SceneManager con configuración SOLID"),this.setupSceneContainer(),this.setupGlobalEvents()}setupSceneContainer(){let e=document.getElementById("scene-container");e||(e=document.createElement("div"),e.id="scene-container",e.style.cssText=`
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 1000;
                overflow: hidden;
            `,document.body.appendChild(e)),this.sceneContainer=e}setupGlobalEvents(){this.globalKeyHandler=e=>{this.currentScene&&typeof this.currentScene.handleInput=="function"&&this.currentScene.handleInput(e)},window.addEventListener("keydown",this.globalKeyHandler),this.resizeHandler=()=>{this.currentScene&&typeof this.currentScene.handleResize=="function"&&this.currentScene.handleResize()},window.addEventListener("resize",this.resizeHandler)}registerScene(e,t){if(!e||!t)throw new Error("Nombre de escena y clase requeridos para registro");(typeof t.prototype?.init!="function"||typeof t.prototype?.render!="function")&&this.log("warn",`Escena ${e} no implementa completamente la interfaz IScene`),this.scenes.set(e,t),this.log("info",`Escena ${e} registrada correctamente`),this.config.enablePreloading&&this.preloadScene(e,t)}async preloadScene(e,t){if(!this.sceneInstances.has(e))try{const a=new t;typeof a.init=="function"&&(await a.init(),this.sceneInstances.set(e,a),this.log("debug",`Escena ${e} precargada`))}catch(a){this.log("error",`Error al precargar escena ${e}:`,a)}}async transitionTo(e,t=null){if(this.isTransitioning)return this.log("warn","Transición ya en progreso, ignorando nueva transición"),!1;if(!this.scenes.has(e))return this.handleError("Transición fallida",new Error(`Escena ${e} no está registrada`)),!1;this.isTransitioning=!0,this.transitionData=t;try{return this.log("info",`Iniciando transición a: ${e}`),this.emit("transitionStart",{from:this.currentScene?.constructor.name,to:e}),await this.cleanupCurrentScene(),this.prepareDOM(e),await this.createNewScene(e,t),this.updateSceneHistory(e),this.finalizeTransition(e),!0}catch(a){return this.handleError("Error en transición de escena",a),this.isTransitioning=!1,!1}}async cleanupCurrentScene(){if(this.currentScene)try{this.log("debug","Limpiando escena actual..."),typeof this.currentScene.cleanup=="function"&&await this.currentScene.cleanup(),this.currentScene=null}catch(e){this.handleError("Error al limpiar escena actual",e)}}prepareDOM(e){const t=document.getElementById("gameCanvas");t&&(t.style.display="none"),document.querySelectorAll('[id$="-scene-container"]').forEach(i=>{i.parentNode&&i.parentNode.removeChild(i)}),this.log("debug",`DOM preparado para escena ${e}`)}async createNewScene(e,t){const a=this.scenes.get(e);if(!a)throw new Error(`Escena ${e} no está registrada`);this.config.enableCaching&&this.sceneInstances.has(e)?(this.currentScene=this.sceneInstances.get(e),this.log("debug",`Usando escena ${e} desde caché`)):(this.currentScene=new a,this.log("debug",`Nueva instancia de escena ${e} creada`)),this.setupSceneCallbacks(this.currentScene),typeof this.currentScene.init=="function"&&await this.currentScene.init(),typeof this.currentScene.render=="function"&&await this.currentScene.render(),this.log("info",`Escena ${e} creada y renderizada correctamente`)}setupSceneCallbacks(e){typeof e.onTransitionTo=="function"&&(e.onTransitionTo=(t,a)=>this.transitionTo(t,a)),typeof e.onGoBack=="function"&&(e.onGoBack=()=>this.goBack())}updateSceneHistory(e){(this.sceneHistory.length===0||this.sceneHistory[this.sceneHistory.length-1]!==e)&&this.sceneHistory.push(e),this.sceneHistory.length>this.config.maxHistorySize&&this.sceneHistory.shift(),this.log("debug",`Historial actualizado: ${this.sceneHistory.join(" -> ")}`)}finalizeTransition(e){this.isTransitioning=!1,this.transitionData=null,this.emit("transitionComplete",{scene:e,timestamp:Date.now()}),this.log("info",`Transición a ${e} completada`)}async goBack(){if(this.sceneHistory.length<2)return this.log("warn","No hay escena anterior en el historial"),!1;this.sceneHistory.pop();const e=this.sceneHistory[this.sceneHistory.length-1],t=this.sceneHistory.length,a=await this.transitionTo(e);return a&&(this.sceneHistory.length=t),a}cleanupSpecific(){this.globalKeyHandler&&window.removeEventListener("keydown",this.globalKeyHandler),this.resizeHandler&&window.removeEventListener("resize",this.resizeHandler),this.currentScene&&typeof this.currentScene.cleanup=="function"&&this.currentScene.cleanup(),this.sceneInstances.forEach((e,t)=>{typeof e.cleanup=="function"&&e.cleanup()}),this.scenes.clear(),this.sceneInstances.clear(),this.currentScene=null,this.sceneHistory=[],this.sceneContainer&&this.sceneContainer.parentNode&&this.sceneContainer.parentNode.removeChild(this.sceneContainer),this.log("info","SceneManager limpiado completamente")}getCurrentScene(){return this.currentScene}getCurrentSceneName(){return this.currentScene?.constructor.name||null}isSceneActive(e){return this.getCurrentSceneName()===e}getSceneHistory(){return[...this.sceneHistory]}getRegisteredScenes(){return Array.from(this.scenes.keys())}hasScene(e){return this.scenes.has(e)}getTransitionState(){return{isTransitioning:this.isTransitioning,transitionData:this.transitionData,currentScene:this.getCurrentSceneName(),history:this.getSceneHistory()}}}class B extends y{constructor(e={}){super("InputManager",{autoStart:!0,maxBufferLength:20,bufferTimeWindow:500,enableP2:!0,enableGamepad:!1,...e}),this.keys={},this.inputBuffer_p1=[],this.inputBuffer_p2=[],this.singlePressActions=["punch","kick","special","super"],this.actionStates={},this.keyMap={p1:{up:"w",down:"s",left:"a",right:"d",punch:" ",kick:"q",special:"e",super:"r"},p2:{up:"ArrowUp",down:"ArrowDown",left:"ArrowLeft",right:"ArrowRight",punch:"Enter",kick:"Shift",special:"Control",super:"Alt"}},this.keyLocks={},this.actionCooldowns={},this.COOLDOWN_TIME=300}async initializeSpecific(){this.log("info","Inicializando InputManager con arquitectura SOLID"),this.setupEventListeners(),this.initializeInputStates()}setupEventListeners(){window.addEventListener("keydown",e=>{this.handleKeyDown(e)}),window.addEventListener("keyup",e=>{this.handleKeyUp(e)}),this.log("debug","Event listeners de input configurados")}initializeInputStates(){for(const e of["p1","p2"])for(const t of this.singlePressActions){const a=`${e}_${t}`;this.actionStates[a]=!1}this.log("debug","Estados de input inicializados")}handleKeyDown(e){this.keys[e.key]||(this.keys[e.key]=!0,this.recordMetric("keyPressed",1),this.processKeyPress(e.key))}handleKeyUp(e){this.keys[e.key]=!1,this.recordMetric("keyReleased",1),this.resetActionStates(e.key)}processKeyPress(e){for(const[t,a]of Object.entries(this.keyMap))for(const[i,n]of Object.entries(a))if(n===e&&this.singlePressActions.includes(i)){const s=`${t}_${i}`;this.actionStates[s]||(this.actionStates[s]=!0,this.log("debug",`Acción activada: ${s}`))}}resetActionStates(e){for(const[t,a]of Object.entries(this.keyMap))for(const[i,n]of Object.entries(a))if(n===e&&this.singlePressActions.includes(i)){const s=`${t}_${i}`;this.actionStates[s]=!1,this.log("debug",`Acción desactivada: ${s}`)}}init(){console.warn("InputManager.init() está deprecated, use initialize() en su lugar"),this.isInitialized||this.initialize()}update(){this.processPlayerInputs("p1"),this.config.enableP2&&this.processPlayerInputs("p2"),this.cleanupBuffers()}processPlayerInputs(e){const t=this.keyMap[e],a=e==="p1"?this.inputBuffer_p1:this.inputBuffer_p2;for(const i in t){const n=t[i],s=Date.now();this.keys[n]&&!this.keyLocks[n]&&(!this.actionCooldowns[i]||s-this.actionCooldowns[i]>=this.COOLDOWN_TIME)&&(a.push({action:i,timestamp:s}),this.keyLocks[n]=!0,this.actionCooldowns[i]=s)}}cleanupBuffers(){this.inputBuffer_p1.length>this.MAX_BUFFER_LENGTH&&(this.inputBuffer_p1=this.inputBuffer_p1.slice(-this.MAX_BUFFER_LENGTH)),this.inputBuffer_p2.length>this.MAX_BUFFER_LENGTH&&(this.inputBuffer_p2=this.inputBuffer_p2.slice(-this.MAX_BUFFER_LENGTH))}checkSequence(e,t,a=500){const i=t===1?this.inputBuffer_p1:this.inputBuffer_p2;if(i.length<e.length)return!1;let n=e.length-1,s=Date.now(),r=null;for(let o=i.length-1;o>=0;o--)if(i[o].action===e[n]){if(r&&r-i[o].timestamp>150)return!1;if(r=i[o].timestamp,n--,n<0)return s-i[o].timestamp<=a}return!1}isPressed(e){return!!this.keys[e]}isActionPressed(e,t){const a=this.keyMap[e],i=this.isPressed(a[t]);if(this.singlePressActions.includes(t)){const n=`${e}_${t}`;return i&&this.actionStates[n]?(this.actionStates[n]=!1,!0):!1}return i}remapKey(e,t,a){return this.keyMap[e]&&this.keyMap[e][t]?(this.keyMap[e][t]=a,this.log("info",`Tecla remapeada: ${e}.${t} -> ${a}`),!0):(this.log("warn",`No se pudo remapear tecla: ${e}.${t}`),!1)}async cleanupSpecific(){window.removeEventListener("keydown",this.handleKeyDown),window.removeEventListener("keyup",this.handleKeyUp),this.inputBuffer_p1.length=0,this.inputBuffer_p2.length=0,this.keys={},this.actionStates={},this.keyLocks={},this.actionCooldowns={},this.log("info","InputManager limpiado completamente")}}let C=class g extends y{constructor(e=null,t={}){super("UserPreferencesManager",{autoStart:!0,enableLocalStorage:!0,enableCloudSync:!1,autoSave:!0,storageKey:"game-user-preferences",...t}),this.preferences=null,this.apiClient=e,this.defaultPreferences=null,this.autoSaveTimeout=null,g.instance||(g.instance=this)}async initializeSpecific(){this.log("info","Inicializando UserPreferencesManager con arquitectura SOLID"),this.setupDefaultPreferences(),await this.loadStoredPreferences(),this.config.autoSave&&this.setupAutoSave()}setupDefaultPreferences(){this.defaultPreferences={audio:{masterVolume:.7,musicVolume:.5,sfxVolume:.8,enabled:!0},graphics:{quality:"medium",showFPS:!1,enableParticles:!0,enableScreenShake:!0},controls:{player1:{up:"w",down:"s",left:"a",right:"d",punch:" ",kick:"q",special:"e",super:"r"},player2:{up:"ArrowUp",down:"ArrowDown",left:"ArrowLeft",right:"ArrowRight",punch:"Enter",kick:"Shift",special:"Control",super:"Alt"}},gameplay:{difficulty:"normal",enableTutorials:!0,showComboPrompts:!0,pauseOnFocusLoss:!0},ui:{language:"es",theme:"dark",showDebugInfo:!1},user:{id:null,username:"Jugador",stats:{gamesPlayed:0,wins:0,losses:0}}},this.log("debug","Preferencias por defecto configuradas")}async loadStoredPreferences(){try{this.config.enableLocalStorage&&await this.loadFromLocalStorage(),this.config.enableCloudSync&&this.apiClient&&await this.loadFromCloud(),this.preferences||(this.preferences={...this.defaultPreferences},this.log("info","Usando preferencias por defecto")),this.preferences=this.validateAndCompletePreferences(this.preferences)}catch(e){this.handleError("Error cargando preferencias",e),this.preferences={...this.defaultPreferences}}}async loadFromLocalStorage(){try{const e=localStorage.getItem(this.config.storageKey);e&&(this.preferences=JSON.parse(e),this.log("debug","Preferencias cargadas desde localStorage"),this.recordMetric("preferencesLoadedLocal",1))}catch(e){this.log("warn","Error cargando desde localStorage",e)}}async loadFromCloud(){try{if(this.apiClient&&typeof this.apiClient.getUserPreferences=="function"){const e=await this.apiClient.getUserPreferences();e&&(this.preferences=e,this.log("debug","Preferencias cargadas desde la nube"),this.recordMetric("preferencesLoadedCloud",1))}}catch(e){this.log("warn","Error cargando desde la nube",e)}}validateAndCompletePreferences(e){return this.deepMerge(this.defaultPreferences,e||{})}deepMerge(e,t){const a={...e};for(const i in t)t[i]&&typeof t[i]=="object"&&!Array.isArray(t[i])?a[i]=this.deepMerge(e[i]||{},t[i]):a[i]=t[i];return a}setupAutoSave(){this.debouncedSave=this.debounce(()=>{this.savePreferences()},1e3),this.log("debug","Auto-guardado configurado")}getPreferences(){return this.preferences}async updatePreferences(e){try{return this.preferences=this.deepMerge(this.preferences,e),this.recordMetric("preferencesUpdated",1),this.log("debug","Preferencias actualizadas"),this.config.autoSave&&this.debouncedSave&&this.debouncedSave(),this.emit("preferencesUpdated",this.preferences),this.preferences}catch(t){throw this.handleError("Error actualizando preferencias",t),t}}async savePreferences(){try{this.config.enableLocalStorage&&(localStorage.setItem(this.config.storageKey,JSON.stringify(this.preferences)),this.log("debug","Preferencias guardadas en localStorage")),this.config.enableCloudSync&&this.apiClient&&await this.saveToCloud(),this.recordMetric("preferencesSaved",1)}catch(e){this.handleError("Error guardando preferencias",e)}}async saveToCloud(){try{this.apiClient&&typeof this.apiClient.updateUserPreferences=="function"&&(await this.apiClient.updateUserPreferences(this.preferences),this.log("debug","Preferencias guardadas en la nube"))}catch(e){this.log("warn","Error guardando en la nube",e)}}getControlsForPlayer(e){const t=e===1?"player1":"player2";return this.preferences?.controls?.[t]||this.defaultPreferences.controls[t]}getVolume(){return this.preferences?.audio||this.defaultPreferences.audio}isDebugModeEnabled(){return this.preferences?.ui?.showDebugInfo||!1}async resetToDefaults(){this.preferences={...this.defaultPreferences},await this.savePreferences(),this.emit("preferencesReset",this.preferences),this.log("info","Preferencias reseteadas a valores por defecto")}debounce(e,t){return(...a)=>{clearTimeout(this.autoSaveTimeout),this.autoSaveTimeout=setTimeout(()=>e.apply(this,a),t)}}async cleanupSpecific(){this.preferences&&this.config.autoSave&&await this.savePreferences(),this.autoSaveTimeout&&(clearTimeout(this.autoSaveTimeout),this.autoSaveTimeout=null),this.preferences=null,this.apiClient=null,this.debouncedSave=null,this.log("info","UserPreferencesManager limpiado completamente")}static instance=null;static setApiClient(e){g.instance&&(g.instance.apiClient=e)}static async loadPreferences(e){if(g.instance)return await g.instance.loadStoredPreferences()}static getPreferences(){return g.instance?.getPreferences()}static async updatePreferences(e){if(g.instance)return await g.instance.updatePreferences(e)}static getControlsForPlayer(e){return g.instance?.getControlsForPlayer(e)}static getVolume(){return g.instance?.getVolume()}static isDebugModeEnabled(){return g.instance?.isDebugModeEnabled()}};class G{constructor(e=null){this.authToken=null,this.currentUser=null,this.apiClient=e}async register(e,t){return this.apiClient?await this.apiClient.register(e,t):new Promise(a=>{setTimeout(()=>{a({success:!0,message:"Usuario registrado exitosamente"})},100)})}async login(e,t){if(this.apiClient)try{const a=await this.apiClient.login(e,t);return this.authToken=a.token,this.currentUser=a.user,sessionStorage.setItem("authToken",this.authToken),sessionStorage.setItem("currentUser",JSON.stringify(this.currentUser)),a}catch(a){throw a}return new Promise(a=>{setTimeout(()=>{this.authToken="mock-token-123",this.currentUser={id:1,name:"Usuario Mock",role:"USER",email:e},sessionStorage.setItem("authToken",this.authToken),sessionStorage.setItem("currentUser",JSON.stringify(this.currentUser)),a({token:this.authToken,user:this.currentUser})},200)})}logout(){this.authToken=null,this.currentUser=null,sessionStorage.removeItem("authToken"),sessionStorage.removeItem("currentUser")}getToken(){return this.authToken}getUser(){return this.currentUser}isAuthenticated(){return this.authToken!==null}init(){const e=sessionStorage.getItem("authToken"),t=sessionStorage.getItem("currentUser");e&&t&&(this.authToken=e,this.currentUser=JSON.parse(t))}}class H extends y{constructor(e={}){super("AudioManager",{autoStart:!0,volume:.7,musicVolume:.5,sfxVolume:.8,isEnabled:!0,enableSpatialAudio:!1,maxSimultaneousSounds:10,...e}),this.sounds=new Map,this.music=null,this.activeSounds=new Set,this.audioContext=null,this.masterGainNode=null,this.musicGainNode=null,this.sfxGainNode=null}async initializeSpecific(){this.log("info","Inicializando AudioManager con arquitectura SOLID");try{await this.initializeWebAudio(),await this.loadBasicSounds(),this.setupVolumeControls()}catch(e){throw this.handleError("Error inicializando AudioManager",e),e}}async initializeWebAudio(){try{this.audioContext=new(window.AudioContext||window.webkitAudioContext),this.masterGainNode=this.audioContext.createGain(),this.musicGainNode=this.audioContext.createGain(),this.sfxGainNode=this.audioContext.createGain(),this.musicGainNode.connect(this.masterGainNode),this.sfxGainNode.connect(this.masterGainNode),this.masterGainNode.connect(this.audioContext.destination),this.masterGainNode.gain.value=this.config.volume,this.musicGainNode.gain.value=this.config.musicVolume,this.sfxGainNode.gain.value=this.config.sfxVolume,this.log("debug","Web Audio API inicializada correctamente")}catch{this.log("warn","Web Audio API no disponible, usando HTML5 Audio"),this.audioContext=null}}setupVolumeControls(){this.setVolume(this.config.volume),this.setMusicVolume(this.config.musicVolume),this.setSfxVolume(this.config.sfxVolume),this.log("debug","Controles de volumen configurados")}async loadBasicSounds(){const e=[{name:"hit",url:"src/assets/audio/hit.mp3"},{name:"block",url:"src/assets/audio/block.mp3"},{name:"jump",url:"src/assets/audio/jump.mp3"},{name:"special",url:"src/assets/audio/special.mp3"}];for(const t of e)await this.loadSound(t.name,t.url);this.log("info","Sonidos básicos cargados correctamente")}async loadSound(e,t){try{const a=new Audio(t);return a.preload="auto",a.volume=this.config.sfxVolume,a.addEventListener("ended",()=>{this.activeSounds.delete(a)}),this.sounds.set(e,a),this.recordMetric("soundLoaded",1),this.log("debug",`Sonido cargado: ${e}`),a}catch(a){return this.log("warn",`No se pudo cargar el sonido: ${e}`,a),null}}async loadMusic(e){try{return this.music=new Audio(e),this.music.loop=!0,this.music.volume=this.config.musicVolume,this.music.preload="auto",this.recordMetric("musicLoaded",1),this.log("debug","Música cargada correctamente"),this.music}catch(t){return this.handleError("Error cargando música",t),null}}playSound(e,t=null){if(!this.config.isEnabled){this.log("debug","Audio deshabilitado");return}const a=this.sounds.get(e);if(!a){this.log("warn",`Sonido no encontrado: ${e}`);return}if(this.activeSounds.size>=this.config.maxSimultaneousSounds){this.log("debug","Límite de sonidos simultáneos alcanzado");return}try{const i=a.cloneNode();i.volume=t!==null?t:this.config.sfxVolume,this.activeSounds.add(i),i.play(),this.recordMetric("soundPlayed",1),this.log("debug",`Sonido reproducido: ${e}`)}catch(i){this.log("warn",`Error reproduciendo sonido: ${e}`,i)}}playMusic(){if(!this.config.isEnabled||!this.music){this.log("debug","Música no disponible o audio deshabilitado");return}try{this.music.currentTime=0,this.music.play(),this.recordMetric("musicPlayed",1),this.log("debug","Música iniciada")}catch(e){this.log("warn","Error reproduciendo música",e)}}stopMusic(){this.music&&(this.music.pause(),this.music.currentTime=0,this.log("debug","Música detenida"))}setVolume(e){this.config.volume=Math.max(0,Math.min(1,e)),this.masterGainNode&&(this.masterGainNode.gain.value=this.config.volume),this.log("debug",`Volumen general configurado: ${this.config.volume}`)}setMusicVolume(e){this.config.musicVolume=Math.max(0,Math.min(1,e)),this.music&&(this.music.volume=this.config.musicVolume),this.musicGainNode&&(this.musicGainNode.gain.value=this.config.musicVolume),this.log("debug",`Volumen de música configurado: ${this.config.musicVolume}`)}setSfxVolume(e){this.config.sfxVolume=Math.max(0,Math.min(1,e)),this.sfxGainNode&&(this.sfxGainNode.gain.value=this.config.sfxVolume),this.log("debug",`Volumen de SFX configurado: ${this.config.sfxVolume}`)}enable(){this.config.isEnabled=!0,this.log("info","Audio habilitado")}disable(){this.config.isEnabled=!1,this.stopMusic(),this.stopAllSounds(),this.log("info","Audio deshabilitado")}stopAllSounds(){for(const e of this.activeSounds)e.pause(),e.currentTime=0;this.activeSounds.clear(),this.log("debug","Todos los sonidos detenidos")}async cleanupSpecific(){this.stopAllSounds(),this.stopMusic(),this.audioContext&&this.audioContext.state!=="closed"&&await this.audioContext.close(),this.sounds.clear(),this.activeSounds.clear(),this.music=null,this.audioContext=null,this.log("info","AudioManager limpiado completamente")}}class Y{constructor(e={}){this.config={maxMetricsHistory:e.maxMetricsHistory||50,monitoringInterval:e.monitoringInterval||5e3,maxAlerts:e.maxAlerts||20,thresholds:{memoryUsage:e.memoryThreshold||50*1024*1024,frameTime:e.frameTimeThreshold||16.67,gcCount:e.gcCountThreshold||10,domNodes:e.domNodesThreshold||1e3},...e},this.state={isMonitoring:!1,startTime:null,frameCount:0,lastFrameTime:null},this.metrics=new Map,this.alerts=[],this.intervals=new Set,this.frameCallbacks=new Set,console.log("📊 PerformanceMonitor v2.0 inicializado")}start(){if(this.state.isMonitoring){console.warn("⚠️ PerformanceMonitor ya está en ejecución");return}this.state.isMonitoring=!0,this.state.startTime=Date.now(),this.state.lastFrameTime=performance.now(),console.log("📊 PerformanceMonitor v2.0 iniciado"),this.startPeriodicCollection(),this.startFrameRateMonitoring()}startPeriodicCollection(){const e=setInterval(()=>{if(this.state.isMonitoring)try{this.collectMetrics(),this.checkThresholds()}catch(t){console.warn("⚠️ Error en recolección de métricas:",t)}},this.config.monitoringInterval);this.intervals.add(e)}startFrameRateMonitoring(){const e=a=>{if(this.state.isMonitoring)try{this.state.frameCount++,this.recordFrameTime(a);const i=requestAnimationFrame(e);this.frameCallbacks.add(i)}catch(i){console.warn("⚠️ Error en monitoreo de frame rate:",i)}},t=requestAnimationFrame(e);this.frameCallbacks.add(t)}stop(){if(!this.state.isMonitoring){console.warn("⚠️ PerformanceMonitor no está en ejecución");return}this.state.isMonitoring=!1,this.intervals.forEach(e=>clearInterval(e)),this.intervals.clear(),this.frameCallbacks.forEach(e=>cancelAnimationFrame(e)),this.frameCallbacks.clear(),console.log("📊 PerformanceMonitor v2.0 detenido")}collectMetrics(){const e=Date.now(),t={timestamp:e,memory:this.getMemoryMetrics(),dom:this.getDOMMetrics(),performance:this.getPerformanceMetrics(),uptime:e-this.state.startTime};return this.storeMetrics(e,t),t}storeMetrics(e,t){if(this.metrics.set(e,t),this.metrics.size>this.config.maxMetricsHistory){const a=Math.min(...this.metrics.keys());this.metrics.delete(a)}}getMemoryMetrics(){if(!performance.memory)return{used:0,total:0,limit:0,available:!1};const e=performance.memory;return{used:e.usedJSHeapSize,total:e.totalJSHeapSize,limit:e.jsHeapSizeLimit,available:!0,usagePercentage:e.usedJSHeapSize/e.jsHeapSizeLimit*100}}getDOMMetrics(){try{return{totalNodes:document.querySelectorAll("*").length,canvasElements:document.querySelectorAll("canvas").length,eventListeners:this.estimateEventListeners(),stylesheets:document.styleSheets.length}}catch(e){return console.warn("⚠️ Error obteniendo métricas DOM:",e),{totalNodes:0,canvasElements:0,eventListeners:0,stylesheets:0}}}getPerformanceMetrics(){return{frameCount:this.state.frameCount,averageFPS:this.calculateAverageFPS(),currentFPS:this.calculateCurrentFPS(),memoryPressure:this.calculateMemoryPressure()}}estimateEventListeners(){try{return document.querySelectorAll("button, input, a, canvas, [onclick], [onkeydown], [onmousedown]").length*1.5}catch{return 0}}recordFrameTime(e){this.state.lastFrameTime=e}calculateAverageFPS(){if(!this.state.startTime||this.state.frameCount===0)return 0;const e=(Date.now()-this.state.startTime)/1e3;return Math.round(this.state.frameCount/e)}calculateCurrentFPS(){if(!this.state.lastFrameTime)return 0;const t=performance.now()-this.state.lastFrameTime;return t>0?Math.round(1e3/t):0}calculateMemoryPressure(){const e=this.getMemoryMetrics();if(!e.available)return"unknown";const t=e.usagePercentage;return t<50?"low":t<75?"medium":t<90?"high":"critical"}checkThresholds(){const e=this.getCurrentMetrics();if(!e)return;const t=[];e.memory.available&&e.memory.used>this.config.thresholds.memoryUsage&&t.push({type:"memory",severity:"warning",message:`Uso de memoria alto: ${Math.round(e.memory.used/1024/1024)}MB`,value:e.memory.used,threshold:this.config.thresholds.memoryUsage}),e.performance.averageFPS>0&&e.performance.averageFPS<45&&t.push({type:"fps",severity:e.performance.averageFPS<30?"error":"warning",message:`FPS bajo: ${e.performance.averageFPS}`,value:e.performance.averageFPS,threshold:60}),e.dom.totalNodes>this.config.thresholds.domNodes&&t.push({type:"dom",severity:"warning",message:`Muchos nodos DOM: ${e.dom.totalNodes}`,value:e.dom.totalNodes,threshold:this.config.thresholds.domNodes}),t.forEach(a=>{this.addAlert(a)})}addAlert(e){e.timestamp=Date.now(),this.alerts.push(e),this.alerts.length>this.config.maxAlerts&&this.alerts.shift();const t=e.severity==="error"?"❌":"⚠️";console.warn(`${t} [PerformanceMonitor] ${e.message}`)}getCurrentMetrics(){if(this.metrics.size===0)return null;const e=Math.max(...this.metrics.keys());return this.metrics.get(e)}getAllMetrics(){return Array.from(this.metrics.values()).sort((e,t)=>e.timestamp-t.timestamp)}getRecentAlerts(e=5){const t=Date.now()-e*60*1e3;return this.alerts.filter(a=>a.timestamp>t)}recordFrame(e){try{e&&typeof e=="object"&&(this.lastGameFrame={...e,timestamp:Date.now()})}catch(t){console.warn("⚠️ Error registrando frame:",t)}}generateReport(){const e=this.getCurrentMetrics(),t=this.getRecentAlerts();return{status:t.length===0?"healthy":"issues",uptime:e?e.uptime:0,currentMetrics:e,recentAlerts:t,summary:{memoryUsage:e?`${Math.round(e.memory.used/1024/1024)}MB`:"N/A",averageFPS:e?e.performance.averageFPS:0,domNodes:e?e.dom.totalNodes:0,alertCount:t.length,memoryPressure:e?e.performance.memoryPressure:"unknown"}}}clear(){this.metrics.clear(),this.alerts.length=0,this.state.frameCount=0,this.state.startTime=Date.now(),console.log("🧹 PerformanceMonitor limpiado")}destroy(){this.stop(),this.clear(),this.intervals.clear(),this.frameCallbacks.clear(),this.metrics=null,this.alerts=null,this.state=null,console.log("🗑️ PerformanceMonitor destruido")}}let b=class extends y{constructor(e={}){super("JuiceManager",{hitStopEnabled:!0,screenShakeEnabled:!0,particlesEnabled:!0,maxParticles:100,...e}),this.hitStopFrames=0,this.screenShake={intensity:0,duration:0,timer:0},this.particles=[]}async initializeSpecific(){this.log("info","Inicializando JuiceManager con arquitectura SOLID");try{this.validateConfig(),this.initializeParticleSystem(),this.log("info","JuiceManager inicializado correctamente")}catch(e){throw this.log("error","Error inicializando JuiceManager",e),e}}validateConfig(){const e=["hitStopEnabled","screenShakeEnabled","particlesEnabled"];for(const t of e)if(this.config[t]===void 0)throw new Error(`Configuración requerida faltante: ${t}`)}initializeParticleSystem(){this.particles=[],this.particlePool=[];for(let e=0;e<this.config.maxParticles;e++)this.particlePool.push(this.createParticle());this.log("info",`Pool de partículas creado: ${this.config.maxParticles} partículas`)}createParticle(){return{x:0,y:0,vx:0,vy:0,life:0,maxLife:30,color:"#ffffff",gravity:.2,active:!1}}triggerHitStop(e){if(!this.config.hitStopEnabled){this.log("debug","Hit stop deshabilitado en configuración");return}this.hitStopFrames=Math.max(this.hitStopFrames,e),this.log("debug",`Hit stop activado: ${e} frames`),this.emit("hitStopTriggered",{frames:e})}triggerScreenShake(e,t){if(!this.config.screenShakeEnabled){this.log("debug","Screen shake deshabilitado en configuración");return}this.screenShake={intensity:Math.max(this.screenShake.intensity,e),duration:Math.max(this.screenShake.duration,t),timer:Math.max(this.screenShake.timer,t)},this.log("debug",`Screen shake activado: intensidad=${e}, duración=${t}`),this.emit("screenShakeTriggered",{intensity:e,duration:t})}createParticles(e){if(!this.config.particlesEnabled){this.log("debug","Partículas deshabilitadas en configuración");return}const t={x:0,y:0,count:5,color:"#ffffff",velocity:{min:1,max:3},life:30,...e};for(let a=0;a<t.count;a++){if(this.particles.length>=this.config.maxParticles){this.log("debug","Límite máximo de partículas alcanzado");break}const i=this.getParticleFromPool();i&&(this.initializeParticle(i,t),this.particles.push(i))}this.log("debug",`Partículas creadas: ${t.count}, total activas: ${this.particles.length}`),this.emit("particlesCreated",{count:t.count,config:t})}getParticleFromPool(){return this.particlePool.find(e=>!e.active)||this.createParticle()}initializeParticle(e,t){const a=t.velocity.min+Math.random()*(t.velocity.max-t.velocity.min),i=Math.random()*Math.PI*2;e.x=t.x,e.y=t.y,e.vx=Math.cos(i)*a,e.vy=Math.sin(i)*a,e.life=t.life,e.maxLife=t.life,e.color=t.color,e.active=!0}update(){try{this.updateHitStop(),this.updateScreenShake(),this.updateParticles()}catch(e){this.log("error","Error en update del JuiceManager",e)}}updateHitStop(){this.hitStopFrames>0&&(this.hitStopFrames--,this.hitStopFrames===0&&this.emit("hitStopEnded"))}updateScreenShake(){this.screenShake.timer>0&&(this.screenShake.timer--,this.screenShake.timer===0&&this.emit("screenShakeEnded"))}updateParticles(){this.particles=this.particles.filter(e=>(e.x+=e.vx,e.y+=e.vy,e.vy+=e.gravity||.2,e.life--,e.life<=0?(e.active=!1,!1):!0))}isHitStopActive(){return this.hitStopFrames>0}getScreenShakeOffset(){if(this.screenShake.timer<=0)return{x:0,y:0};const e=this.screenShake.intensity*(this.screenShake.timer/this.screenShake.duration);return{x:(Math.random()-.5)*e,y:(Math.random()-.5)*e}}renderParticles(e){!this.config.particlesEnabled||!e||this.particles.forEach(t=>{e.save(),e.globalAlpha=Math.max(0,t.life/t.maxLife),e.fillStyle=t.color,e.beginPath(),e.arc(t.x,t.y,3,0,Math.PI*2),e.fill(),e.restore()})}clearAllEffects(){this.hitStopFrames=0,this.screenShake={intensity:0,duration:0,timer:0},this.particles.forEach(e=>e.active=!1),this.particles=[],this.log("info","Todos los efectos limpiados"),this.emit("allEffectsCleared")}getStats(){return{hitStopActive:this.isHitStopActive(),hitStopFrames:this.hitStopFrames,screenShakeActive:this.screenShake.timer>0,activeParticles:this.particles.length,pooledParticles:this.particlePool.filter(e=>!e.active).length,...this.getMetrics()}}};const w={characters:[{id:1,name:"Ken",spriteSheetUrl:"/src/assets/images/ken-spritesheet.png",configPath:"../characters_base/KenBase.js",enabled:!0,health:1e3,speed:2,jumpForce:-420,superMeterGainOnHit:10,superMeterGainOnBlock:5,superMeterGainOnTakeDamage:7},{id:2,name:"Ryu",spriteSheetUrl:"/src/assets/images/ryu-spritesheet.png",configPath:"../characters_base/RyuBase.js",enabled:!0,health:1050,speed:1.8,jumpForce:-400,superMeterGainOnHit:12,superMeterGainOnBlock:6,superMeterGainOnTakeDamage:8}],stages:[{id:1,name:"Ken Stage",enabled:!0,backgroundUrl:"/src/assets/images/Backgrounds/Ken-Stage.png"},{id:2,name:"Dojo",enabled:!0,backgroundUrl:""},{id:3,name:"Street",enabled:!1,backgroundUrl:""}],music:[{id:1,name:"Battle Theme 1",enabled:!0,url:""},{id:2,name:"Battle Theme 2",enabled:!0,url:""},{id:3,name:"Menu Theme",enabled:!1,url:""}],userPreferences:{1:{controls:{p1:{up:"w",down:"s",left:"a",right:"d",punch:" ",kick:"q",special:"e",super:"r"}},volume:.7,debugMode:!1}},users:[{id:1,email:"test@example.com",role:"USER",name:"Test User"},{id:2,email:"admin@example.com",role:"ADMIN",name:"Admin User"}]};class j{constructor(){this.mockData=w,this.latencyConfig={fast:10,normal:50,slow:100}}simulateLatency(e="normal"){const t=this.latencyConfig[e]||this.latencyConfig.normal,a=Math.random()*20;return t+a}async register(e,t){return new Promise((a,i)=>{setTimeout(()=>{if(!e||!t){i(new Error("Email y password requeridos"));return}if(this.mockData.users.find(s=>s.email===e)){i(new Error("Usuario ya existe"));return}a({success:!0,message:"Usuario registrado exitosamente",user:{id:Date.now(),email:e,role:"USER"}})},this.simulateLatency("normal"))})}async login(e,t){return new Promise((a,i)=>{setTimeout(()=>{if(!e||!t){i(new Error("Credenciales requeridas"));return}const n=this.mockData.users.find(s=>s.email===e);n?a({token:"mockToken123",user:{...n,name:n.name||"Mock User"}}):i(new Error("Credenciales inválidas"))},this.simulateLatency("normal"))})}async getPlayableCharacters(){return new Promise(e=>{setTimeout(()=>{const t=this.mockData.characters.filter(a=>a.enabled!==!1);e(t)},this.simulateLatency("fast"))})}async getAllCharacters(){return new Promise(e=>{setTimeout(()=>{e([...this.mockData.characters])},this.simulateLatency("normal"))})}async addCharacter(e){return new Promise((t,a)=>{setTimeout(()=>{if(!e||!e.name){a(new Error("Datos de personaje inválidos"));return}const i={...e,id:Date.now(),enabled:e.enabled!==void 0?e.enabled:!0};this.mockData.characters.push(i),t(i)},this.simulateLatency("normal"))})}async updateCharacter(e,t){return new Promise((a,i)=>{setTimeout(()=>{const n=this.mockData.characters.findIndex(s=>s.id===e);if(n===-1){i(new Error("Personaje no encontrado"));return}this.mockData.characters[n]={...this.mockData.characters[n],...t},a(this.mockData.characters[n])},this.simulateLatency("normal"))})}async deleteCharacter(e){return new Promise((t,a)=>{setTimeout(()=>{const i=this.mockData.characters.length;if(this.mockData.characters=this.mockData.characters.filter(n=>n.id!==e),this.mockData.characters.length===i){a(new Error("Personaje no encontrado"));return}t({success:!0,message:"Personaje eliminado"})},this.simulateLatency("normal"))})}async getStages(){return new Promise(e=>{setTimeout(()=>{e([...this.mockData.stages])},this.simulateLatency("fast"))})}async addStage(e){return new Promise((t,a)=>{setTimeout(()=>{if(!e||!e.name){a(new Error("Datos de escenario inválidos"));return}const i={...e,id:Date.now(),enabled:e.enabled!==void 0?e.enabled:!0};this.mockData.stages.push(i),t(i)},this.simulateLatency("normal"))})}async getMusic(){return new Promise(e=>{setTimeout(()=>{e([...this.mockData.music])},this.simulateLatency("fast"))})}async addMusic(e){return new Promise((t,a)=>{setTimeout(()=>{if(!e||!e.name){a(new Error("Datos de música inválidos"));return}const i={...e,id:Date.now(),enabled:e.enabled!==void 0?e.enabled:!0};this.mockData.music.push(i),t(i)},this.simulateLatency("normal"))})}async getUserPreferences(e){return new Promise(t=>{setTimeout(()=>{const a=this.mockData.userPreferences[e]||{};t({...a})},this.simulateLatency("fast"))})}async updateUserPreferences(e){return new Promise((t,a)=>{setTimeout(()=>{if(!e||typeof e!="object"){a(new Error("Preferencias inválidas"));return}const i=1;this.mockData.userPreferences[i]={...this.mockData.userPreferences[i],...e},t(this.mockData.userPreferences[i])},this.simulateLatency("normal"))})}simulateNetworkError(e=.1){return Math.random()<e}getStats(){return{totalCharacters:this.mockData.characters.length,enabledCharacters:this.mockData.characters.filter(e=>e.enabled).length,totalStages:this.mockData.stages.length,totalTracks:this.mockData.music.length,totalUsers:this.mockData.users.length}}}class X{constructor(e="/api"){this.baseUrl=e}async register(e,t){return await(await fetch(`${this.baseUrl}/auth/register`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:e,password:t})})).json()}async login(e,t){return await(await fetch(`${this.baseUrl}/auth/login`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:e,password:t})})).json()}async getPlayableCharacters(){return await(await fetch(`${this.baseUrl}/characters/playable`)).json()}async getAllCharacters(){return await(await fetch(`${this.baseUrl}/characters`)).json()}async addCharacter(e){return await(await fetch(`${this.baseUrl}/characters`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)})).json()}async updateCharacter(e,t){return await(await fetch(`${this.baseUrl}/characters/${e}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(t)})).json()}async deleteCharacter(e){return(await fetch(`${this.baseUrl}/characters/${e}`,{method:"DELETE"})).ok}async getStages(){return await(await fetch(`${this.baseUrl}/stages`)).json()}async addStage(e){return await(await fetch(`${this.baseUrl}/stages`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)})).json()}async getMusic(){return await(await fetch(`${this.baseUrl}/music`)).json()}async addMusic(e){return await(await fetch(`${this.baseUrl}/music`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)})).json()}async getUserPreferences(e){return await(await fetch(`${this.baseUrl}/users/me/preferences`)).json()}async updateUserPreferences(e){return await(await fetch(`${this.baseUrl}/users/me/preferences`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)})).json()}}class x extends y{constructor(e={}){super("VisualEffectsManager",{autoStart:!0,enableParticles:!0,enableScreenShake:!0,enableHitSpark:!0,enableTrails:!0,maxParticles:100,particleLifetime:2e3,...e}),this.particleContainer=null,this.shakeIntensity=0,this.isShaking=!1,this.animeAvailable=!1,this.activeEffects=new Map,this.particlePool=[],this.effectQueue=[]}async initializeSpecific(){this.log("info","Inicializando VisualEffectsManager con arquitectura SOLID"),this.checkAnimeAvailability(),this.createParticleContainer(),this.initializeParticlePool(),this.setupEffectProcessing()}checkAnimeAvailability(){this.animeAvailable=typeof anime<"u",this.animeAvailable?this.log("debug","anime.js disponible y configurado"):this.log("warn","anime.js no está disponible. Algunos efectos estarán limitados.")}createParticleContainer(){this.particleContainer||(this.particleContainer=document.createElement("div"),this.particleContainer.id="particle-container",this.particleContainer.style.cssText=`
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 150;
        `,document.body.appendChild(this.particleContainer),this.log("debug","Contenedor de partículas creado"))}initializeParticlePool(){for(let e=0;e<this.config.maxParticles;e++){const t=this.createParticleElement();t.style.display="none",this.particlePool.push(t),this.particleContainer.appendChild(t)}this.log("debug",`Pool de ${this.config.maxParticles} partículas inicializado`)}createParticleElement(){const e=document.createElement("div");return e.className="vfx-particle",e.style.cssText=`
            position: absolute;
            border-radius: 50%;
            pointer-events: none;
            background: #fff;
        `,e}setupEffectProcessing(){this.effectProcessingInterval=setInterval(()=>{this.processEffectQueue()},16)}processEffectQueue(){if(this.effectQueue.length===0)return;const e=this.effectQueue.shift();this.executeEffect(e)}executeEffect(e){if(!this.config.autoStart){this.log("warn","Efectos deshabilitados por configuración");return}switch(e.type){case"screenShake":this.performScreenShake(e.intensity,e.duration);break;case"flash":this.performFlashEffect(e.intensity,e.duration);break;case"shockwave":this.performShockwave(e.x,e.y,e.maxSize,e.color);break;case"particleBurst":this.performParticleBurst(e.x,e.y,e.count,e.colors);break;default:this.log("warn",`Tipo de efecto desconocido: ${e.type}`)}}safeAnime(e){return this.animeAvailable?anime(e):(this.log("warn","anime.js no disponible, usando fallback"),e.complete&&setTimeout(e.complete,e.duration||1e3),null)}screenShake(e=8,t=150){if(!this.config.enableScreenShake){this.log("debug","Screen shake deshabilitado por configuración");return}this.effectQueue.push({type:"screenShake",intensity:e,duration:t})}performScreenShake(e,t){if(this.isShaking){this.log("debug","Screen shake ya en progreso");return}if(this.isShaking=!0,this.recordMetric("screenShake",1),!this.animeAvailable){this.fallbackScreenShake(e,t);return}this.safeAnime({targets:"body",translateX:[{value:anime.random(-e,e),duration:50},{value:0,duration:50}],translateY:[{value:anime.random(-e,e),duration:50},{value:0,duration:50}],duration:t,easing:"easeInOutSine",complete:()=>{this.isShaking=!1,this.log("debug","Screen shake completado")}})}fallbackScreenShake(e,t){const a=document.body;let i=Date.now();const n=setInterval(()=>{if(Date.now()-i>=t){clearInterval(n),a.style.transform="translate(0, 0)",this.isShaking=!1,this.log("debug","Fallback screen shake completado");return}const r=(Math.random()-.5)*e*2,o=(Math.random()-.5)*e*2;a.style.transform=`translate(${r}px, ${o}px)`},50)}flashEffect(e=.8,t=100){if(!this.config.enableParticles){this.log("debug","Flash effect deshabilitado por configuración");return}this.effectQueue.push({type:"flash",intensity:e,duration:t})}performFlashEffect(e,t){this.recordMetric("flashEffect",1);const a=document.getElementById("flashOverlay");if(!a){this.log("warn","Elemento flashOverlay no encontrado");return}this.safeAnime({targets:a,opacity:[0,e,0],duration:t,easing:"easeInQuad"})}createShockwave(e,t,a=300,i="#facc15"){if(!this.config.enableParticles){this.log("debug","Shockwave effect deshabilitado por configuración");return}this.effectQueue.push({type:"shockwave",x:e,y:t,maxSize:a,color:i})}performShockwave(e,t,a,i){this.recordMetric("shockwave",1);const n=document.createElement("div");n.classList.add("shockwave"),n.style.cssText=`
            position: absolute;
            left: ${e}px;
            top: ${t}px;
            width: 0px;
            height: 0px;
            border-radius: 50%;
            border: 4px solid ${i};
            transform: translate(-50%, -50%);
            opacity: 0.8;
            pointer-events: none;
        `,this.particleContainer.appendChild(n),this.safeAnime({targets:n,width:["0px",`${a}px`],height:["0px",`${a}px`],opacity:[.8,0],borderWidth:["10px","0px"],duration:500,easing:"easeOutExpo",complete:()=>{n.remove(),this.log("debug","Shockwave completado")}})}random(e,t){return Math.floor(Math.random()*(t-e+1))+e}createParticleBurst(e,t,a=50,i=["#facc15","#fb923c","#ef4444"]){if(!this.config.enableParticles){this.log("debug","Particle burst deshabilitado por configuración");return}this.effectQueue.push({type:"particleBurst",x:e,y:t,count:a,colors:i})}performParticleBurst(e,t,a,i){this.recordMetric("particleBurst",1);for(let n=0;n<a;n++){const s=this.getParticleFromPool();if(!s){this.log("warn","Pool de partículas agotado");break}this.configureParticle(s,e,t,i),this.animateParticle(s)}}getParticleFromPool(){return this.particlePool.find(e=>e.style.display==="none")}configureParticle(e,t,a,i){const n=i[this.random(0,i.length-1)],s=this.random(2,6);e.style.cssText=`
            position: absolute;
            left: ${t}px;
            top: ${a}px;
            width: ${s}px;
            height: ${s}px;
            border-radius: 50%;
            background: ${n};
            display: block;
            pointer-events: none;
        `}animateParticle(e){const t=Math.random()*Math.PI*2,a=this.random(50,150),i=parseFloat(e.style.left)+Math.cos(t)*a,n=parseFloat(e.style.top)+Math.sin(t)*a;this.safeAnime({targets:e,left:i+"px",top:n+"px",opacity:[1,0],scale:[1,0],duration:this.random(800,1600),easing:"easeOutExpo",complete:()=>{e.style.display="none",this.log("debug","Partícula animación completada")}})}async cleanupSpecific(){this.effectProcessingInterval&&(clearInterval(this.effectProcessingInterval),this.effectProcessingInterval=null),this.activeEffects.clear(),this.effectQueue.length=0,this.particleContainer&&(this.particleContainer.remove(),this.particleContainer=null),this.particlePool.length=0,this.log("info","VisualEffectsManager limpiado completamente")}setEffectsEnabled(e){this.config.autoStart=e,this.log("info",`Efectos ${e?"habilitados":"deshabilitados"}`)}}class K{constructor(e={}){this.config={isDevelopment:!0,enablePerformanceMonitoring:!0,...e},this.instances=new Map}createApiClient(){if(this.instances.has("apiClient"))return this.instances.get("apiClient");const e=this.config.isDevelopment?new j(this.config.apiConfig):new X(this.config.apiConfig);return this.instances.set("apiClient",e),e}createAuthManager(){if(this.instances.has("authManager"))return this.instances.get("authManager");const e=this.createApiClient(),t=new G(e,this.config.authConfig);return this.instances.set("authManager",t),t}createAudioManager(){if(this.instances.has("audioManager"))return this.instances.get("audioManager");const e=new H(this.config.audioConfig);return this.instances.set("audioManager",e),e}createInputManager(){if(this.instances.has("inputManager"))return this.instances.get("inputManager");const e=new B(this.config.inputConfig);return this.instances.set("inputManager",e),e}createVisualEffectsManager(){if(this.instances.has("visualEffectsManager"))return this.instances.get("visualEffectsManager");const e=new x(this.config.vfxConfig);return this.instances.set("visualEffectsManager",e),e}createUserPreferencesManager(){if(this.instances.has("userPreferencesManager"))return this.instances.get("userPreferencesManager");const e=this.createApiClient(),t=new C(e,this.config.preferencesConfig);return this.instances.set("userPreferencesManager",t),t}createSceneManager(){if(this.instances.has("sceneManager"))return this.instances.get("sceneManager");const e=new q(this.config.sceneConfig);return this.instances.set("sceneManager",e),e}createGameManager(){if(this.instances.has("gameManager"))return this.instances.get("gameManager");const e=this.createApiClient(),t=this.createJuiceManager(),a=new V(e,this.config.gameConfig,t);return this.instances.set("gameManager",a),a}createPerformanceMonitor(){if(this.instances.has("performanceMonitor"))return this.instances.get("performanceMonitor");const e=new Y(this.config.performanceConfig);return this.instances.set("performanceMonitor",e),e}createJuiceManager(){if(this.instances.has("juiceManager"))return this.instances.get("juiceManager");const e=new b(this.config.juiceConfig);return this.instances.set("juiceManager",e),e}setupUserPreferencesManager(){const e=this.createApiClient();C.setApiClient(e)}createAllManagers(){return{apiClient:this.createApiClient(),authManager:this.createAuthManager(),audioManager:this.createAudioManager(),inputManager:this.createInputManager(),visualEffectsManager:this.createVisualEffectsManager(),userPreferencesManager:this.createUserPreferencesManager(),sceneManager:this.createSceneManager(),gameManager:this.createGameManager(),performanceMonitor:this.createPerformanceMonitor(),juiceManager:this.createJuiceManager()}}async initializeAllManagers(){const e=this.createAllManagers(),t=["performanceMonitor","audioManager","inputManager","userPreferencesManager","visualEffectsManager","juiceManager","authManager","sceneManager","gameManager"],a={};for(const i of t){const n=e[i];if(n&&typeof n.initialize=="function")try{await n.initialize(),a[i]=n,console.log(`✅ ${i} inicializado correctamente`)}catch(s){throw console.error(`❌ Error inicializando ${i}:`,s),s}else a[i]=n}return a.apiClient=e.apiClient,a}clearInstances(){this.instances.clear()}getInstance(e){return this.instances.get(e)}hasInstance(e){return this.instances.has(e)}getAllInstances(){return Object.fromEntries(this.instances)}getStats(){return{totalInstances:this.instances.size,instanceNames:Array.from(this.instances.keys()),config:{...this.config}}}}class p{static setupResponsiveCanvas(e){if(!e){console.warn("⚠️ ResponsiveUtils: Canvas no proporcionado para configuración responsiva");return}const t=()=>{const n=(e.parentElement||document.body).getBoundingClientRect();e.width=n.width,e.height=n.height,e.style.width="100%",e.style.height="100%"};t();const a=()=>{requestAnimationFrame(t)};return window.addEventListener("resize",a),e._responsiveCleanup=()=>{window.removeEventListener("resize",a)},e}static getResponsiveContainerStyles(e="main"){const t={main:`
                width: 100%;
                height: 100vh;
                padding: clamp(1rem, 4vw, 2rem);
                font-size: clamp(0.875rem, 2.5vw, 1rem);
                overflow-x: hidden;
                overflow-y: auto;
            `,card:`
                width: 100%;
                max-width: min(90vw, 400px);
                padding: clamp(1rem, 4vw, 2rem);
                margin: clamp(0.5rem, 2vw, 1rem);
            `,button:`
                padding: clamp(0.5rem, 2vw, 1rem) clamp(1rem, 4vw, 2rem);
                font-size: clamp(0.875rem, 2.5vw, 1rem);
                border-radius: clamp(4px, 1vw, 8px);
            `,title:`
                font-size: clamp(1.5rem, 6vw, 3rem);
                margin-bottom: clamp(1rem, 4vw, 2rem);
                line-height: 1.2;
            `,text:`
                font-size: clamp(0.875rem, 2.5vw, 1rem);
                line-height: 1.5;
            `};return t[e]||t.main}static getBreakpoints(){return{mobile:"(max-width: 480px)",tablet:"(max-width: 768px)",desktop:"(min-width: 769px)",large:"(min-width: 1024px)",landscape:"(orientation: landscape)",portrait:"(orientation: portrait)"}}static getDeviceType(){const e=window.innerWidth;return e<=480?"mobile":e<=768?"tablet":"desktop"}static isLandscape(){return window.innerWidth>window.innerHeight}static init(){console.log("📱 Sistema responsivo inicializado");const e=this.getDeviceType();document.body.classList.add(`device-${e}`);const t=()=>{document.body.classList.toggle("landscape",this.isLandscape()),document.body.classList.toggle("portrait",!this.isLandscape())};t(),window.addEventListener("resize",t),window.addEventListener("orientationchange",t);let a=document.querySelector('meta[name="viewport"]');a||(a=document.createElement("meta"),a.name="viewport",a.content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no",document.head.appendChild(a))}static cleanup(e){e&&e._responsiveCleanup&&(e._responsiveCleanup(),delete e._responsiveCleanup)}static applyResponsiveStyles(e,t){if(e&&e.style){const a=this.getResponsiveContainerStyles(t);e.style.cssText+=a}}}class P{constructor(e){this.apiClient=new j,this.authManager=new G,this.onAuthSuccess=e,this.container=null,this.particleCanvas=null,this.animationId=null,p.init()}render(){const e=document.getElementById("gameCanvas");e&&(e.style.display="none");const t=p.getDeviceType();this.container=document.createElement("div"),this.container.id="login-scene-container",this.container.className="responsive-container login-container",this.container.style.cssText=`
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: var(--dark-bg);
            background-image: 
                radial-gradient(circle at 20% 80%, rgba(0, 242, 255, 0.15) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(255, 0, 193, 0.15) 0%, transparent 50%);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            font-family: 'Inter', sans-serif;
            overflow-x: hidden;
            overflow-y: auto;
            padding: ${t==="mobile"?"clamp(1rem, 5vw, 1.5rem)":"clamp(1rem, 4vw, 2rem)"};
            gap: ${t==="mobile"?"1rem":"1.5rem"};
        `,this.particleCanvas=document.createElement("canvas"),this.particleCanvas.id="login-particles",this.particleCanvas.className="responsive-canvas",this.particleCanvas.style.cssText=`
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
            pointer-events: none;
        `,p.setupResponsiveCanvas(this.particleCanvas);const a=document.createElement("h1");a.textContent=t==="mobile"?"FIGHTER 2D":"FIGHTER 2D LOGIN",a.className="responsive-title login-title",a.style.cssText=`
            font-family: 'Orbitron', monospace;
            font-size: ${t==="mobile"?"clamp(1.2rem, 5vw, 2rem)":"clamp(1.5rem, 6vw, 3rem)"};
            font-weight: 900;
            color: #fff;
            margin-bottom: ${t==="mobile"?"clamp(1rem, 4vw, 1.5rem)":"clamp(2rem, 5vw, 3rem)"};
            text-shadow: 0 0 10px var(--primary-glow), 0 0 20px var(--primary-glow);
            opacity: 0;
            transform: translateY(-30px);
            z-index: 3;
            text-align: center;
            max-width: 100%;
            word-wrap: break-word;
        `;const i=document.createElement("form");i.className="holographic-form responsive-form",i.style.cssText=`
            width: 100%;
            max-width: ${t==="mobile"?"95vw":"min(90vw, 400px)"};
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid var(--primary-glow);
            border-radius: 15px;
            padding: ${t==="mobile"?"clamp(1rem, 4vw, 1.5rem)":"clamp(1.5rem, 4vw, 2rem)"};
            box-shadow: 
                0 0 30px rgba(0, 242, 255, 0.3),
                inset 0 0 30px rgba(0, 242, 255, 0.1);
            backdrop-filter: blur(10px);
            z-index: 3;
            position: relative;
            opacity: 0;
            transform: scale(0.9) translateY(20px);
        `;const n=document.createElement("div");n.className="input-wrapper responsive-input-wrapper",n.style.cssText=`
            position: relative;
            margin-bottom: ${t==="mobile"?"1.2rem":"1.5rem"};
        `;const s=document.createElement("input");s.type="email",s.id="email-input",s.className="responsive-input",s.placeholder="usuario@dominio.com",s.required=!0,s.style.cssText=`
            width: 100%;
            padding: ${t==="mobile"?"12px":"15px"};
            background: rgba(0, 242, 255, 0.1);
            border: 1px solid var(--primary-glow);
            border-radius: 8px;
            color: #fff;
            font-size: ${t==="mobile"?"1rem":"1.1rem"};
            box-shadow: 0 0 10px rgba(0, 242, 255, 0.5) inset;
            transition: all 0.3s ease;
            opacity: 0;
            transform: translateY(15px);
            box-sizing: border-box;
            min-height: ${t==="mobile"?"44px":"auto"};
            touch-action: manipulation;
        `;const r=document.createElement("div");r.className="validation-burst",r.style.cssText=`
            position: absolute;
            right: -10px;
            top: ${t==="mobile"?"12px":"15px"};
            width: 20px;
            height: 20px;
        `,n.appendChild(s),n.appendChild(r);const o=document.createElement("div");o.className="input-wrapper responsive-input-wrapper",o.style.cssText=`
            position: relative;
            margin-bottom: ${t==="mobile"?"1.5rem":"2rem"};
        `;const l=document.createElement("input");l.type="password",l.id="password-input",l.className="responsive-input",l.placeholder="contraseña",l.required=!0,l.style.cssText=`
            width: 100%;
            padding: ${t==="mobile"?"12px":"15px"};
            background: rgba(0, 242, 255, 0.1);
            border: 1px solid var(--primary-glow);
            border-radius: 8px;
            color: #fff;
            font-size: ${t==="mobile"?"1rem":"1.1rem"};
            box-shadow: 0 0 10px rgba(0, 242, 255, 0.5) inset;
            transition: all 0.3s ease;
            opacity: 0;
            transform: translateY(15px);
            box-sizing: border-box;
            min-height: ${t==="mobile"?"44px":"auto"};
            touch-action: manipulation;
        `;const c=document.createElement("div");c.className="validation-burst",c.style.cssText=`
            position: absolute;
            right: -10px;
            top: ${t==="mobile"?"12px":"15px"};
            width: 20px;
            height: 20px;
        `,o.appendChild(l),o.appendChild(c);const d=document.createElement("button");d.type="submit",d.textContent="INICIAR SESIÓN",d.className="login-button responsive-button",d.style.cssText=`
            width: 100%;
            padding: ${t==="mobile"?"12px":"15px"};
            background: linear-gradient(45deg, var(--primary-glow), var(--secondary-glow));
            border: none;
            border-radius: 8px;
            color: #000;
            font-family: 'Orbitron', monospace;
            font-size: ${t==="mobile"?"1rem":"1.1rem"};
            font-weight: 700;
            cursor: pointer;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 1px;
            box-shadow: 0 0 20px rgba(0, 242, 255, 0.5);
            opacity: 0;
            transform: translateY(15px);
            min-height: ${t==="mobile"?"44px":"auto"};
            touch-action: manipulation;
        `;const u=document.createElement("button");return u.type="button",u.textContent="CREAR CUENTA",u.className="register-button responsive-button",u.style.cssText=`
            width: 100%;
            padding: ${t==="mobile"?"12px":"15px"};
            background: transparent;
            border: 2px solid var(--secondary-glow);
            border-radius: 8px;
            color: var(--secondary-glow);
            font-family: 'Orbitron', monospace;
            font-size: ${t==="mobile"?"0.9rem":"1rem"};
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-top: ${t==="mobile"?"0.8rem":"1rem"};
            opacity: 0;
            transform: translateY(15px);
            min-height: ${t==="mobile"?"44px":"auto"};
            touch-action: manipulation;
        `,i.appendChild(n),i.appendChild(o),i.appendChild(d),i.appendChild(u),this.container.appendChild(this.particleCanvas),this.container.appendChild(a),this.container.appendChild(i),document.body.appendChild(this.container),this.startLoginAnimation(),this.setupValidation(),this.setupEventListeners(i,s,l),this.startParticleBackground(),this.container}startLoginAnimation(){if(typeof anime>"u"){console.warn("⚠️ anime.js no disponible en LoginScene");return}const e=this.container.querySelector("h1"),t=this.container.querySelector(".holographic-form"),a=this.container.querySelectorAll("input"),i=this.container.querySelectorAll("button");anime.timeline({easing:"easeOutExpo"}).add({targets:e,opacity:[0,1],translateY:[-30,0],duration:800}).add({targets:t,opacity:[0,1],scale:[.9,1],translateY:[20,0],duration:600},"-=400").add({targets:a,opacity:[0,1],translateY:[15,0],delay:anime.stagger(200,{start:300}),duration:500},"-=400").add({targets:i,opacity:[0,1],translateY:[15,0],delay:anime.stagger(100),duration:400},"-=200")}setupValidation(){const e=document.getElementById("email-input");e.addEventListener("input",()=>{const t=e.parentElement.querySelector(".validation-burst"),a=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.value);if(e.value.length===0)e.className="";else{e.className=a?"valid":"invalid",e.style.borderColor=a?"var(--success-glow)":"var(--secondary-glow)",e.style.boxShadow=a?"0 0 10px rgba(0, 255, 140, 0.7) inset, 0 0 5px var(--success-glow)":"0 0 10px rgba(255, 0, 193, 0.7) inset, 0 0 5px var(--secondary-glow)";const i=a?"var(--success-glow)":"var(--secondary-glow)";typeof anime<"u"&&anime({targets:t,innerHTML:[0,10],easing:"linear",duration:200,update:()=>{for(let n=0;n<2;n++){const s=document.createElement("div");s.style.cssText=`
                                    position: absolute;
                                    width: ${anime.random(3,8)}px;
                                    height: ${anime.random(3,8)}px;
                                    background: ${i};
                                    border-radius: 50%;
                                `,t.appendChild(s),anime({targets:s,top:anime.random(-20,20),left:anime.random(-20,20),opacity:[1,0],duration:anime.random(300,600),easing:"easeOutExpo",complete:()=>s.remove()})}}})}})}setupEventListeners(e,t,a){e.querySelectorAll("button").forEach(s=>{s.addEventListener("mouseenter",()=>{typeof anime<"u"&&anime({targets:s,scale:1.05,boxShadow:s.type==="submit"?"0 0 30px rgba(0, 242, 255, 0.8)":"0 0 20px rgba(255, 0, 193, 0.6)",duration:200,easing:"easeOutQuad"})}),s.addEventListener("mouseleave",()=>{typeof anime<"u"&&anime({targets:s,scale:1,boxShadow:s.type==="submit"?"0 0 20px rgba(0, 242, 255, 0.5)":"0 0 0px rgba(255, 0, 193, 0)",duration:200,easing:"easeOutQuad"})})}),e.addEventListener("submit",async s=>{s.preventDefault(),await this.handleLogin(t.value,a.value)}),e.querySelector('button[type="button"]').addEventListener("click",()=>{this.handleRegister()})}startParticleBackground(){if(!this.particleCanvas)return;const e=this.particleCanvas.getContext("2d"),t=[];for(let i=0;i<50;i++)t.push({x:Math.random()*this.particleCanvas.width,y:Math.random()*this.particleCanvas.height,size:Math.random()*2+1,speedX:(Math.random()-.5)*1,speedY:(Math.random()-.5)*1,opacity:Math.random()*.5+.2,color:Math.random()>.5?"rgba(0, 242, 255, ":"rgba(255, 0, 193, "});const a=()=>{e.clearRect(0,0,this.particleCanvas.width,this.particleCanvas.height),t.forEach(i=>{i.x+=i.speedX,i.y+=i.speedY,(i.x<0||i.x>this.particleCanvas.width)&&(i.speedX*=-1),(i.y<0||i.y>this.particleCanvas.height)&&(i.speedY*=-1),e.globalAlpha=i.opacity,e.fillStyle=i.color+i.opacity+")",e.beginPath(),e.arc(i.x,i.y,i.size,0,Math.PI*2),e.fill()}),document.getElementById("login-scene-container")&&(this.animationId=requestAnimationFrame(a))};a()}async handleLogin(e,t){if(console.log("🔐 Intentando login...",{email:e}),typeof anime<"u"){const a=this.container.querySelector(".holographic-form");anime({targets:a,scale:[1,.98,1],boxShadow:["0 0 30px rgba(0, 242, 255, 0.3)","0 0 50px rgba(0, 242, 255, 0.8)","0 0 30px rgba(0, 242, 255, 0.3)"],duration:600,easing:"easeInOutSine"})}try{const a=await this.apiClient.login(e,t);a.success?(console.log("✅ Login exitoso"),typeof anime<"u"?anime({targets:this.container,opacity:[1,0],scale:[1,1.1],duration:500,easing:"easeInExpo",complete:()=>{this.onAuthSuccess&&this.onAuthSuccess(a.user)}}):this.onAuthSuccess&&this.onAuthSuccess(a.user)):this.showError("Credenciales inválidas")}catch(a){console.error("❌ Error en login:",a),this.showError("Error de conexión")}}handleRegister(){console.log("📝 Abriendo registro..."),this.showError("Funcionalidad de registro no implementada aún")}showError(e){const t=this.container.querySelector(".holographic-form");let a=t.querySelector(".error-message");a||(a=document.createElement("div"),a.className="error-message",a.style.cssText=`
                background: rgba(255, 0, 0, 0.1);
                border: 1px solid var(--danger-glow);
                border-radius: 8px;
                padding: 10px;
                margin-top: 1rem;
                color: var(--danger-glow);
                text-align: center;
                font-family: 'Orbitron', monospace;
                opacity: 0;
                transform: translateY(-10px);
            `,t.appendChild(a)),a.textContent=e,typeof anime<"u"?(anime({targets:t,translateX:[0,-10,10,-5,5,0],duration:400,easing:"easeInOutSine"}),anime({targets:a,opacity:[0,1],translateY:[-10,0],duration:300,easing:"easeOutExpo"}),setTimeout(()=>{anime({targets:a,opacity:[1,0],translateY:[0,-10],duration:300,easing:"easeInExpo"})},3e3)):(a.style.opacity="1",a.style.transform="translateY(0)")}cleanup(){this.animationId&&cancelAnimationFrame(this.animationId),this.particleCanvas&&p.cleanup(this.particleCanvas),this.container&&this.container.remove(),this.container=null,this.particleCanvas=null}}class W{constructor(e){this.onComplete=e,this.progress=0,this.progressBar=null,this.progressText=null,this.sparkleElements=[],this.vfx=new x,this.animationId=null,this.loadingTasks=["Inicializando núcleo cuántico...","Calibrando matrices de combate...","Cargando arquetipos de luchadores...","Sincronizando efectos dimensionales...","Compilando algoritmos de IA...","Activando protocolo de batalla...","Optimizando motor gráfico...","Sistema listo para combate..."],this.currentTaskIndex=0,this.isInitialized=!1}init(){this.isInitialized||(this.vfx.init(),this.isInitialized=!0)}render(){this.isInitialized||this.init();const e=document.getElementById("gameCanvas");e&&(e.style.display="none");const t=document.createElement("div");t.id="loading-scene-container",t.className="responsive-container",t.style.cssText=`
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: var(--dark-bg);
            background-image: 
                radial-gradient(circle at 20% 80%, rgba(0, 242, 255, 0.15) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(255, 0, 193, 0.15) 0%, transparent 50%);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            font-family: 'Orbitron', monospace;
            overflow: hidden;
            padding: var(--spacing-lg);
        `;const a=document.createElement("canvas");a.id="loading-particles",a.style.cssText=`
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
            pointer-events: none;
        `,p.setupResponsiveCanvas(a);const i=document.createElement("div");i.className="loading-logo",i.innerHTML="COMBAT ENGINE",i.style.cssText=`
            font-size: var(--font-size-4xl);
            font-weight: 900;
            color: #fff;
            text-shadow: 0 0 20px var(--primary-glow), 0 0 40px var(--primary-glow);
            margin-bottom: var(--spacing-xl);
            position: relative;
            z-index: 10;
            letter-spacing: clamp(2px, 1vw, 3px);
            text-align: center;
        `,i.innerHTML=i.textContent.replace(/\S/g,"<span class='logo-letter'>$&</span>");const n=document.createElement("div");n.className="loading-container",n.style.cssText=`
            position: relative;
            width: var(--container-md);
            max-width: 90vw;
            z-index: 10;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--spacing-lg);
        `;const s=document.createElement("div");s.className="progress-container",s.style.cssText=`
            width: 100%;
            height: 20px;
            background: rgba(0, 0, 0, 0.5);
            border: 2px solid var(--primary-glow);
            border-radius: 10px;
            overflow: hidden;
            position: relative;
            box-shadow: 0 0 20px rgba(0, 242, 255, 0.3);
        `,this.progressBar=document.createElement("div"),this.progressBar.className="progress-bar-fill",this.progressBar.style.cssText=`
            width: 0%;
            height: 100%;
            background: linear-gradient(90deg, var(--primary-glow), var(--secondary-glow));
            border-radius: 8px;
            position: relative;
            transition: width 0.3s ease;
            box-shadow: 0 0 15px var(--primary-glow);
        `;const r=document.createElement("div");r.className="progress-glow",r.style.cssText=`
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
            animation: progressSweep 2s ease-in-out infinite;
        `;const o=document.createElement("div");return o.className="progress-sparkle",o.style.cssText=`
            position: absolute;
            top: 50%;
            right: -5px;
            width: 10px;
            height: 20px;
            background: #fff;
            border-radius: 50%;
            transform: translateY(-50%);
            box-shadow: 0 0 20px #fff, 0 0 30px var(--primary-glow);
            opacity: 0;
        `,this.progressBar.appendChild(r),this.progressBar.appendChild(o),s.appendChild(this.progressBar),this.progressText=document.createElement("div"),this.progressText.className="progress-text",this.progressText.textContent=this.loadingTasks[0],this.progressText.style.cssText=`
            font-size: 1.2rem;
            color: var(--text-color);
            text-align: center;
            min-height: 30px;
            opacity: 0.8;
            font-weight: 400;
        `,this.percentageText=document.createElement("div"),this.percentageText.className="percentage-text",this.percentageText.textContent="0%",this.percentageText.style.cssText=`
            font-size: 2rem;
            font-weight: 700;
            color: var(--primary-glow);
            text-shadow: 0 0 10px var(--primary-glow);
        `,n.appendChild(s),n.appendChild(this.percentageText),n.appendChild(this.progressText),t.appendChild(a),t.appendChild(i),t.appendChild(n),document.body.appendChild(t),this.addLoadingStyles(),this.startLogoAnimation(),this.startParticleBackground(a),this.startLoading(),t}addLoadingStyles(){const e=document.createElement("style");e.textContent=`
            @keyframes progressSweep {
                0% { transform: translateX(-100%); }
                50% { transform: translateX(0%); }
                100% { transform: translateX(100%); }
            }
            
            @keyframes logoGlow {
                0%, 100% { text-shadow: 0 0 20px var(--primary-glow), 0 0 40px var(--primary-glow); }
                50% { text-shadow: 0 0 30px var(--primary-glow), 0 0 60px var(--primary-glow), 0 0 80px var(--secondary-glow); }
            }
            
            .loading-logo { animation: logoGlow 3s ease-in-out infinite; }
            
            .logo-letter {
                display: inline-block;
                opacity: 0;
                transform: translateY(50px);
            }
        `,document.head.appendChild(e)}startLogoAnimation(){const e=document.querySelectorAll(".logo-letter");anime({targets:e,opacity:[0,1],translateY:[50,0],scale:[.5,1],delay:anime.stagger(100,{start:300}),duration:800,easing:"easeOutExpo"})}startParticleBackground(e){const t=e.getContext("2d"),a=[];for(let n=0;n<100;n++)a.push({x:Math.random()*e.width,y:Math.random()*e.height,size:Math.random()*3+1,speedX:(Math.random()-.5)*2,speedY:(Math.random()-.5)*2,opacity:Math.random()*.5+.2,color:Math.random()>.5?"rgba(0, 242, 255, ":"rgba(255, 0, 193, "});const i=()=>{t.clearRect(0,0,e.width,e.height),a.forEach(n=>{n.x+=n.speedX,n.y+=n.speedY,(n.x<0||n.x>e.width)&&(n.speedX*=-1),(n.y<0||n.y>e.height)&&(n.speedY*=-1),t.globalAlpha=n.opacity,t.fillStyle=n.color+n.opacity+")",t.beginPath(),t.arc(n.x,n.y,n.size,0,Math.PI*2),t.fill(),a.forEach(s=>{const r=Math.hypot(n.x-s.x,n.y-s.y);if(r<100){const o=1-r/100;t.globalAlpha=o*.3,t.strokeStyle=n.color+o+")",t.lineWidth=1,t.beginPath(),t.moveTo(n.x,n.y),t.lineTo(s.x,s.y),t.stroke()}})}),document.getElementById("loading-scene-container")&&requestAnimationFrame(i)};i()}startLoading(){const a=setInterval(()=>{this.progress+=1,this.progressBar.style.width=this.progress+"%",this.percentageText.textContent=this.progress+"%";const i=Math.floor(this.progress/100*this.loadingTasks.length);if(i!==this.currentTaskIndex&&i<this.loadingTasks.length&&(this.currentTaskIndex=i,anime({targets:this.progressText,opacity:[1,0],duration:200,complete:()=>{this.progressText.textContent=this.loadingTasks[this.currentTaskIndex],anime({targets:this.progressText,opacity:[0,1],duration:200})}})),this.progress%25===0&&this.progress>0&&this.triggerMilestoneEffect(),this.progress>0){const n=this.progressBar.querySelector(".progress-sparkle");anime({targets:n,opacity:[0,1,0],scale:[.8,1.2,.8],duration:300,easing:"easeInOutSine"})}this.progress>=100&&(clearInterval(a),setTimeout(()=>{this.completeLoading()},1e3))},50)}triggerMilestoneEffect(){this.vfx.flashEffect(.3,150);const t=document.getElementById("loading-scene-container").getBoundingClientRect();this.vfx.createParticleBurst(t.width/2,t.height/2,30,["var(--primary-glow)","var(--secondary-glow)","#ffffff"]),anime({targets:this.progressBar,scale:[1,1.05,1],duration:400,easing:"easeInOutSine"})}completeLoading(){const e=document.getElementById("loading-scene-container");anime.timeline().add({targets:".loading-container",scale:[1,1.1],opacity:[1,.8],duration:500,easing:"easeOutExpo"}).add({targets:".loading-logo .logo-letter",scale:[1,1.2,0],opacity:[1,1,0],delay:anime.stagger(50),duration:600,easing:"easeInExpo"},"-=300").add({targets:e,opacity:[1,0],scale:[1,1.1],duration:800,easing:"easeInExpo",complete:()=>{this.cleanup(),this.onComplete&&this.onComplete()}}),this.vfx.createShockwave(window.innerWidth/2,window.innerHeight/2,500)}cleanup(){const e=document.getElementById("loading-scene-container");e&&e.remove();const t=document.getElementById("gameCanvas");t&&(t.style.display="block"),this.vfx&&this.vfx.cleanup(),this.animationId&&cancelAnimationFrame(this.animationId)}}class A{constructor(e,t){this.onStart=e,this.onOptions=t,this.vfx=new x,this.isInitialized=!1,this.particleCanvas=null,this.isAnimating=!1,this.keyListener=null}init(){this.isInitialized||(this.vfx.init(),this.isInitialized=!0)}render(){this.isInitialized||this.init();const e=document.getElementById("gameCanvas");e&&(e.style.display="none");const t=document.createElement("div");t.id="title-scene-container",t.style.cssText=`
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: var(--dark-bg);
            background-image: 
                radial-gradient(circle at 20% 80%, rgba(0, 242, 255, 0.15) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(255, 0, 193, 0.15) 0%, transparent 50%),
                radial-gradient(circle at 40% 40%, rgba(255, 215, 0, 0.1) 0%, transparent 50%);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            font-family: 'Orbitron', monospace;
            color: white;
            overflow: hidden;
            z-index: 1000;
        `,this.particleCanvas=document.createElement("canvas"),this.particleCanvas.id="title-particles",this.particleCanvas.width=window.innerWidth,this.particleCanvas.height=window.innerHeight,this.particleCanvas.style.cssText=`
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
        `;const a=document.createElement("div");a.className="title-container",a.style.cssText=`
            text-align: center;
            z-index: 10;
            position: relative;
        `;const i=document.createElement("h1");i.className="main-title",i.innerHTML="FIGHTER ARENA",i.style.cssText=`
            font-size: 5rem;
            font-weight: 900;
            margin: 0;
            background: linear-gradient(45deg, var(--primary-glow), var(--secondary-glow), var(--success-glow));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            text-shadow: 0 0 30px rgba(0, 242, 255, 0.5);
            letter-spacing: 8px;
            margin-bottom: 2rem;
        `,i.innerHTML=i.textContent.replace(/\S/g,"<span class='title-letter'>$&</span>");const n=document.createElement("h2");n.className="subtitle",n.textContent="Presiona cualquier tecla para comenzar",n.style.cssText=`
            font-size: 1.5rem;
            color: var(--text-color);
            margin: 20px 0;
            opacity: 0.8;
            font-weight: 400;
        `,a.appendChild(i),a.appendChild(n);const s=document.createElement("div");s.className="menu-container",s.style.cssText=`
            display: flex;
            flex-direction: column;
            gap: 20px;
            margin-top: 50px;
            z-index: 10;
            opacity: 0;
            transform: translateY(30px);
        `;const r=this.createMenuButton("INICIAR JUEGO",()=>{this.cleanup(),this.onStart&&this.onStart()}),o=this.createMenuButton("OPCIONES",()=>{this.cleanup(),this.onOptions&&this.onOptions()}),l=this.createMenuButton("SALIR",()=>{confirm("¿Seguro que quieres salir?")&&window.close()});return s.appendChild(r),s.appendChild(o),s.appendChild(l),t.appendChild(this.particleCanvas),t.appendChild(a),t.appendChild(s),document.body.appendChild(t),this.addTitleStyles(),this.startTitleAnimation(),this.startParticleBackground(),this.addKeyListener(),t}addTitleStyles(){const e=document.createElement("style");e.id="title-scene-styles",e.textContent=`
            @keyframes titleGlow {
                0%, 100% {
                    text-shadow: 0 0 30px rgba(0, 242, 255, 0.5);
                }
                50% {
                    text-shadow: 
                        0 0 40px rgba(0, 242, 255, 0.8),
                        0 0 60px rgba(255, 0, 193, 0.6),
                        0 0 80px rgba(255, 215, 0, 0.4);
                }
            }
            
            @keyframes subtitleBlink {
                0%, 100% { opacity: 0.8; }
                50% { opacity: 0.4; }
            }
            
            @keyframes buttonHover {
                from { box-shadow: 0 5px 15px rgba(0,0,0,0.3); }
                to { 
                    box-shadow: 
                        0 5px 25px rgba(0,0,0,0.4),
                        0 0 30px var(--primary-glow);
                }
            }
            
            .title-letter {
                display: inline-block;
                opacity: 0;
                transform: translateY(50px) rotateX(90deg);
            }
            
            .main-title {
                animation: titleGlow 3s ease-in-out infinite;
            }
            
            .subtitle {
                animation: subtitleBlink 2s ease-in-out infinite;
            }
            
            .menu-button {
                padding: 15px 40px;
                font-size: 1.2rem;
                background: linear-gradient(45deg, #ff6b6b, #ee5a24);
                color: white;
                border: none;
                border-radius: 10px;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                font-weight: bold;
                text-transform: uppercase;
                letter-spacing: 2px;
                font-family: 'Orbitron', monospace;
                position: relative;
                overflow: hidden;
            }
            
            .menu-button:hover {
                transform: translateY(-2px);
                animation: buttonHover 0.3s ease forwards;
            }
            
            .menu-button:active {
                transform: translateY(0px);
            }
            
            .menu-button::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                transition: left 0.5s ease;
            }
            
            .menu-button:hover::before {
                left: 100%;
            }
        `,document.head.appendChild(e)}createMenuButton(e,t){const a=document.createElement("button");return a.className="menu-button",a.textContent=e,a.addEventListener("mouseenter",()=>{const i=a.getBoundingClientRect();this.vfx.createParticleBurst(i.left+i.width/2,i.top+i.height/2,15,["var(--primary-glow)","var(--secondary-glow)","#ffffff"])}),a.addEventListener("click",i=>{i.preventDefault(),anime({targets:a,scale:[1,.95,1],duration:150,easing:"easeInOutSine"}),this.vfx.flashEffect(.2,100),setTimeout(()=>{t()},200)}),a}startTitleAnimation(){const e=document.querySelectorAll(".title-letter"),t=document.querySelector(".menu-container");anime.timeline().add({targets:e,opacity:[0,1],translateY:[50,0],rotateX:[90,0],scale:[.5,1],delay:anime.stagger(100,{start:500}),duration:800,easing:"easeOutExpo"}).add({targets:t,opacity:[0,1],translateY:[30,0],duration:600,easing:"easeOutExpo"},"-=400"),setTimeout(()=>{this.vfx.createShockwave(window.innerWidth/2,window.innerHeight/2,300),this.vfx.screenShake(8)},1e3)}startParticleBackground(){if(!this.particleCanvas)return;const e=this.particleCanvas.getContext("2d"),t=[];for(let i=0;i<150;i++)t.push({x:Math.random()*this.particleCanvas.width,y:Math.random()*this.particleCanvas.height,size:Math.random()*3+1,speedX:(Math.random()-.5)*1,speedY:(Math.random()-.5)*1,opacity:Math.random()*.5+.2,color:this.getRandomColor(),pulse:Math.random()*Math.PI*2});const a=()=>{document.getElementById("title-scene-container")&&(e.clearRect(0,0,this.particleCanvas.width,this.particleCanvas.height),t.forEach(i=>{i.x+=i.speedX,i.y+=i.speedY,i.pulse+=.02,(i.x<0||i.x>this.particleCanvas.width)&&(i.speedX*=-1),(i.y<0||i.y>this.particleCanvas.height)&&(i.speedY*=-1);const n=i.opacity+Math.sin(i.pulse)*.2;e.globalAlpha=Math.max(0,n),e.fillStyle=i.color,e.beginPath(),e.arc(i.x,i.y,i.size,0,Math.PI*2),e.fill(),t.forEach(s=>{const r=Math.hypot(i.x-s.x,i.y-s.y);if(r<120){const o=(1-r/120)*.3;e.globalAlpha=o,e.strokeStyle=i.color,e.lineWidth=.5,e.beginPath(),e.moveTo(i.x,i.y),e.lineTo(s.x,s.y),e.stroke()}})}),requestAnimationFrame(a))};a()}getRandomColor(){const e=["rgba(0, 242, 255, 0.6)","rgba(255, 0, 193, 0.6)","rgba(255, 215, 0, 0.6)","rgba(255, 255, 255, 0.4)"];return e[Math.floor(Math.random()*e.length)]}addKeyListener(){this.keyListener=e=>{(e.code==="Space"||e.code==="Enter")&&(e.preventDefault(),this.cleanup(),this.onStart&&this.onStart())},document.addEventListener("keydown",this.keyListener)}cleanup(){const e=document.getElementById("title-scene-container");e&&anime({targets:e,opacity:[1,0],scale:[1,1.1],duration:500,easing:"easeInExpo",complete:()=>{e.remove()}});const t=document.getElementById("title-scene-styles");t&&t.remove(),this.keyListener&&(document.removeEventListener("keydown",this.keyListener),this.keyListener=null),this.vfx&&this.vfx.cleanup();const a=document.getElementById("gameCanvas");a&&(a.style.display="block")}}class I{constructor(e){this.onModeSelected=e,this.selectedMode=null,this.container=null,this.particleCanvas=null,this.animationId=null,p.init()}render(){const e=document.getElementById("gameCanvas");e&&(e.style.display="none");const t=p.getDeviceType();this.container=document.createElement("div"),this.container.id="game-mode-scene-container",this.container.className="responsive-container gamemode-container",this.container.style.cssText=`
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: var(--dark-bg);
            background-image: 
                radial-gradient(circle at 25% 25%, rgba(0, 242, 255, 0.15) 0%, transparent 50%),
                radial-gradient(circle at 75% 75%, rgba(255, 0, 193, 0.15) 0%, transparent 50%),
                linear-gradient(135deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.9) 100%);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            font-family: 'Inter', sans-serif;
            overflow-x: hidden;
            overflow-y: auto;
            padding: ${t==="mobile"?"clamp(1rem, 5vw, 1.5rem)":"clamp(1rem, 4vw, 2rem)"};
            gap: ${t==="mobile"?"1rem":"1.5rem"};
            box-sizing: border-box;
        `,this.particleCanvas=document.createElement("canvas"),this.particleCanvas.id="gamemode-particles-canvas",this.particleCanvas.className="responsive-canvas",this.particleCanvas.style.cssText=`
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
            pointer-events: none;
        `,p.setupResponsiveCanvas(this.particleCanvas);const a=document.createElement("h1");a.textContent=t==="mobile"?"SELECCIONA MODO":"SELECCIONA TU MODO DE BATALLA",a.className="responsive-title gamemode-title",a.style.cssText=`
            font-family: 'Orbitron', monospace;
            font-size: ${t==="mobile"?"clamp(1rem, 6vw, 1.8rem)":"clamp(1.5rem, 5vw, 3rem)"};
            font-weight: 900;
            color: #fff;
            margin-bottom: ${t==="mobile"?"1rem":"clamp(1.5rem, 4vw, 2.5rem)"};
            text-shadow: 
                0 0 10px var(--primary-glow),
                0 0 20px var(--primary-glow),
                0 0 30px rgba(0, 242, 255, 0.5);
            text-align: center;
            letter-spacing: ${t==="mobile"?"1px":"clamp(1px, 0.5vw, 3px)"};
            text-transform: uppercase;
            z-index: 3;
            position: relative;
            opacity: 0;
            transform: translateY(-30px);
            max-width: 100%;
            word-wrap: break-word;
            padding: 0 1rem;
            box-sizing: border-box;
        `;const i=document.createElement("div");i.className="modes-container responsive-grid",i.style.cssText=`
            display: grid;
            grid-template-columns: ${t==="mobile"?"1fr":"repeat(auto-fit, minmax(min(280px, 100%), 1fr))"};
            gap: ${t==="mobile"?"1rem":"clamp(1rem, 3vw, 2rem)"};
            width: 100%;
            max-width: ${t==="mobile"?"100%":"min(95vw, 1200px)"};
            z-index: 3;
            position: relative;
            padding: ${t==="mobile"?"0.5rem":"1rem"};
            box-sizing: border-box;
            overflow: visible;
            margin: ${t==="mobile"?"0.5rem":"1rem"};
        `,[{id:"story",title:"MODO HISTORIA",subtitle:"Aventura Épica",description:"Descubre la historia de cada luchador en una aventura cinematográfica",icon:"📖",color:"var(--primary-glow)",gradient:"linear-gradient(135deg, rgba(0, 242, 255, 0.2) 0%, rgba(0, 242, 255, 0.05) 100%)",features:["Cinemáticas épicas","Múltiples finales","Desafíos únicos"]},{id:"arcade",title:"MODO ARCADE",subtitle:"Combate Clásico",description:"Enfréntate a oponentes cada vez más difíciles en batallas consecutivas",icon:"🕹️",color:"var(--warning-glow)",gradient:"linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 215, 0, 0.05) 100%)",features:["8 oponentes","Dificultad creciente","Rankings globales"]},{id:"versus",title:"MODO VS",subtitle:"Combate Directo",description:"Lucha contra otro jugador o la IA en batallas personalizadas",icon:"⚔️",color:"var(--secondary-glow)",gradient:"linear-gradient(135deg, rgba(255, 0, 193, 0.2) 0%, rgba(255, 0, 193, 0.05) 100%)",features:["1v1 épico","Configuración libre","Multijugador local"]},{id:"training",title:"MODO ENTRENAMIENTO",subtitle:"Perfecciona tu Técnica",description:"Practica combos, movimientos especiales y estrategias avanzadas",icon:"🥋",color:"var(--success-glow)",gradient:"linear-gradient(135deg, rgba(0, 255, 140, 0.2) 0%, rgba(0, 255, 140, 0.05) 100%)",features:["Modo libre","Análisis de datos","Combos avanzados"]}].forEach((r,o)=>{const l=this.createModeCard(r,o);i.appendChild(l)});const s=document.createElement("button");return s.textContent="← VOLVER",s.className="responsive-button back-button",s.style.cssText=`
            position: absolute;
            top: ${t==="mobile"?"1rem":"2rem"};
            left: ${t==="mobile"?"1rem":"2rem"};
            background: transparent;
            border: 2px solid var(--secondary-glow);
            color: var(--secondary-glow);
            padding: ${t==="mobile"?"10px 16px":"12px 20px"};
            border-radius: 8px;
            font-family: 'Orbitron', monospace;
            font-size: ${t==="mobile"?"0.85rem":"1rem"};
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 1px;
            z-index: 4;
            opacity: 0;
            transform: translateX(-20px);
            min-height: ${t==="mobile"?"44px":"auto"};
            touch-action: manipulation;
        `,this.setupBackButton(s),this.container.appendChild(this.particleCanvas),this.container.appendChild(s),this.container.appendChild(a),this.container.appendChild(i),document.body.appendChild(this.container),this.startGameModeAnimation(),this.startParticleBackground(),this.container}setupBackButton(e){e.addEventListener("mouseenter",()=>{typeof anime<"u"&&anime({targets:e,scale:1.05,boxShadow:"0 0 20px rgba(255, 0, 193, 0.6)",duration:200,easing:"easeOutQuad"})}),e.addEventListener("mouseleave",()=>{typeof anime<"u"&&anime({targets:e,scale:1,boxShadow:"0 0 0px rgba(255, 0, 193, 0)",duration:200,easing:"easeOutQuad"})}),e.addEventListener("click",()=>{this.handleBack()})}createModeCard(e,t){const a=p.getDeviceType(),i=document.createElement("div");i.className="mode-card responsive-card",i.dataset.mode=e.id,i.style.cssText=`
            background: rgba(0, 0, 0, 0.3);
            background-image: ${e.gradient};
            border: 2px solid ${e.color};
            border-radius: ${a==="mobile"?"10px":"15px"};
            padding: ${a==="mobile"?"1rem":"1.5rem"};
            text-align: center;
            cursor: pointer;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
            box-shadow: 
                0 4px 20px rgba(0, 0, 0, 0.3),
                0 0 30px ${e.color}20;
            position: relative;
            overflow: visible;
            opacity: 0;
            transform: translateY(50px) scale(0.9);
            min-height: ${a==="mobile"?"220px":"280px"};
            max-width: 100%;
            width: 100%;
            box-sizing: border-box;
            touch-action: manipulation;
            margin: ${a==="mobile"?"0.25rem":"0.5rem"};
        `;const n=document.createElement("div");n.style.cssText=`
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(45deg, transparent 30%, ${e.color}10 50%, transparent 70%);
            opacity: 0;
            transition: opacity 0.3s ease;
            pointer-events: none;
        `;const s=document.createElement("div");s.textContent=e.icon,s.className="mode-icon",s.style.cssText=`
            font-size: ${a==="mobile"?"3rem":"4rem"};
            margin-bottom: ${a==="mobile"?"0.8rem":"1rem"};
            filter: drop-shadow(0 0 10px ${e.color});
        `;const r=document.createElement("h3");r.textContent=e.title,r.className="mode-title",r.style.cssText=`
            font-family: 'Orbitron', monospace;
            font-size: ${a==="mobile"?"clamp(1rem, 4vw, 1.2rem)":"clamp(1.2rem, 2.5vw, 1.5rem)"};
            font-weight: 700;
            color: ${e.color};
            margin-bottom: 0.5rem;
            text-shadow: 0 0 10px ${e.color};
            text-transform: uppercase;
            letter-spacing: ${a==="mobile"?"0.5px":"1px"};
            line-height: 1.2;
            overflow-wrap: break-word;
            hyphens: auto;
            word-break: break-word;
        `;const o=document.createElement("div");o.textContent=e.subtitle,o.className="mode-subtitle",o.style.cssText=`
            font-family: 'Inter', sans-serif;
            font-size: ${a==="mobile"?"clamp(0.7rem, 3vw, 0.8rem)":"clamp(0.8rem, 2vw, 0.9rem)"};
            color: var(--text-color);
            margin-bottom: ${a==="mobile"?"0.8rem":"1rem"};
            font-weight: 500;
            opacity: 0.8;
            overflow-wrap: break-word;
            hyphens: auto;
            word-break: break-word;
        `;const l=document.createElement("p");l.textContent=e.description,l.className="mode-description",l.style.cssText=`
            font-family: 'Inter', sans-serif;
            color: var(--text-color);
            font-size: ${a==="mobile"?"clamp(0.75rem, 3.5vw, 0.85rem)":"clamp(0.85rem, 2.2vw, 0.95rem)"};
            line-height: ${a==="mobile"?"1.4":"1.5"};
            margin-bottom: ${a==="mobile"?"1rem":"1.5rem"};
            opacity: 0.9;
            overflow-wrap: break-word;
            hyphens: auto;
            word-break: break-word;
        `;const c=document.createElement("ul");c.className="features-list",c.style.cssText=`
            list-style: none;
            padding: 0;
            margin: 0;
            text-align: left;
        `,e.features.forEach(u=>{const m=document.createElement("li");m.className="feature-item",m.style.cssText=`
                color: var(--text-color);
                margin-bottom: 0.5rem;
                padding-left: 1.5rem;
                position: relative;
                font-family: 'Inter', sans-serif;
                font-size: ${a==="mobile"?"clamp(0.7rem, 3vw, 0.8rem)":"clamp(0.8rem, 2vw, 0.9rem)"};
                opacity: 0.8;
                overflow-wrap: break-word;
                hyphens: auto;
                word-break: break-word;
            `,m.innerHTML=`
                <span style="
                    position: absolute;
                    left: 0;
                    top: 0;
                    color: ${e.color};
                    font-weight: bold;
                ">✓</span>
                ${u}
            `,c.appendChild(m)});const d=document.createElement("button");return d.textContent="SELECCIONAR",d.className="select-button responsive-button",d.style.cssText=`
            width: 100%;
            padding: ${a==="mobile"?"10px":"12px"};
            background: transparent;
            border: 2px solid ${e.color};
            color: ${e.color};
            border-radius: 8px;
            font-family: 'Orbitron', monospace;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-top: 1rem;
            min-height: ${a==="mobile"?"44px":"auto"};
            touch-action: manipulation;
            font-size: ${a==="mobile"?"0.85rem":"1rem"};
        `,this.setupButtonEvents(d,e),this.setupCardEvents(i,n,e),i.appendChild(n),i.appendChild(s),i.appendChild(r),i.appendChild(o),i.appendChild(l),i.appendChild(c),i.appendChild(d),i}setupButtonEvents(e,t){e.addEventListener("mouseenter",()=>{e.style.background=t.color,e.style.color="#000",e.style.boxShadow=`0 0 20px ${t.color}`}),e.addEventListener("mouseleave",()=>{e.style.background="transparent",e.style.color=t.color,e.style.boxShadow="none"}),e.addEventListener("click",a=>{a.stopPropagation(),this.selectMode(t.id)})}setupCardEvents(e,t,a){const i=p.getDeviceType();e.addEventListener("mouseenter",()=>{t.style.opacity="1",typeof anime<"u"&&(anime({targets:e,scale:i==="mobile"?1.02:1.05,boxShadow:`0 10px 30px rgba(0, 0, 0, 0.4), 0 0 40px ${a.color}40`,duration:300,easing:"easeOutQuad"}),this.createHoverParticles(e,a.color))}),e.addEventListener("mouseleave",()=>{t.style.opacity="0",typeof anime<"u"&&anime({targets:e,scale:1,boxShadow:`0 4px 20px rgba(0, 0, 0, 0.3), 0 0 30px ${a.color}20`,duration:300,easing:"easeOutQuad"})}),e.addEventListener("click",()=>{this.selectMode(a.id)})}createHoverParticles(e,t){if(!this.particleCanvas)return;const a=e.getBoundingClientRect(),i=this.particleCanvas.getBoundingClientRect(),n=a.left-i.left+a.width/2,s=a.top-i.top+a.height/2,r=this.particleCanvas.getContext("2d");for(let o=0;o<15;o++){const l={x:n,y:s,radius:anime.random(1,3),alpha:1},c=anime.random(0,360)*Math.PI/180,d=anime.random(30,60);anime({targets:l,x:n+Math.cos(c)*d,y:s+Math.sin(c)*d,alpha:0,duration:anime.random(800,1200),easing:"easeOutExpo",update:()=>{const u=t==="var(--primary-glow)"?"0, 242, 255":t==="var(--warning-glow)"?"255, 215, 0":t==="var(--secondary-glow)"?"255, 0, 193":"0, 255, 140";r.fillStyle=`rgba(${u}, ${l.alpha})`,r.beginPath(),r.arc(l.x,l.y,l.radius,0,2*Math.PI),r.fill()}})}}selectMode(e){if(console.log("🎮 Modo seleccionado:",e),this.selectedMode=e,typeof anime<"u"){const t=this.container.querySelector(`[data-mode="${e}"]`);t&&(anime({targets:t,scale:[1,1.1,1],duration:400,easing:"easeOutElastic(1, .6)"}),this.createSelectionBurst(t))}setTimeout(()=>{this.onModeSelected&&this.onModeSelected(e)},600)}createSelectionBurst(e){if(!this.particleCanvas)return;const t=e.getBoundingClientRect(),a=this.particleCanvas.getBoundingClientRect(),i=t.left-a.left+t.width/2,n=t.top-a.top+t.height/2,s=this.particleCanvas.getContext("2d");for(let r=0;r<30;r++){const o={x:i,y:n,radius:anime.random(2,5),alpha:1},l=anime.random(0,360)*Math.PI/180,c=anime.random(50,100);anime({targets:o,x:i+Math.cos(l)*c,y:n+Math.sin(l)*c,alpha:0,radius:[o.radius,0],duration:anime.random(1e3,1500),easing:"easeOutExpo",update:()=>{s.fillStyle=`rgba(255, 215, 0, ${o.alpha})`,s.beginPath(),s.arc(o.x,o.y,o.radius,0,2*Math.PI),s.fill()}})}}startGameModeAnimation(){if(typeof anime>"u"){console.warn("⚠️ anime.js no disponible en GameModeScene");return}const e=this.container.querySelector("h1"),t=this.container.querySelector("button"),a=this.container.querySelectorAll(".mode-card");anime.timeline({easing:"easeOutExpo"}).add({targets:t,opacity:[0,1],translateX:[-20,0],duration:600}).add({targets:e,opacity:[0,1],translateY:[-30,0],duration:800},"-=400").add({targets:a,opacity:[0,1],translateY:[50,0],scale:[.9,1],delay:anime.stagger(150),duration:600},"-=400")}startParticleBackground(){if(!this.particleCanvas)return;const e=this.particleCanvas.getContext("2d"),t=[];for(let i=0;i<40;i++)t.push({x:Math.random()*this.particleCanvas.width,y:Math.random()*this.particleCanvas.height,size:Math.random()*2+.5,speedX:(Math.random()-.5)*.4,speedY:(Math.random()-.5)*.4,opacity:Math.random()*.3+.1,color:["rgba(0, 242, 255, ","rgba(255, 215, 0, ","rgba(255, 0, 193, ","rgba(0, 255, 140, "][Math.floor(Math.random()*4)]});const a=()=>{e.clearRect(0,0,this.particleCanvas.width,this.particleCanvas.height),t.forEach(i=>{i.x+=i.speedX,i.y+=i.speedY,(i.x<0||i.x>this.particleCanvas.width)&&(i.speedX*=-1),(i.y<0||i.y>this.particleCanvas.height)&&(i.speedY*=-1),e.globalAlpha=i.opacity,e.fillStyle=i.color+i.opacity+")",e.beginPath(),e.arc(i.x,i.y,i.size,0,Math.PI*2),e.fill()}),document.getElementById("game-mode-scene-container")&&(this.animationId=requestAnimationFrame(a))};a()}handleBack(){console.log("🔙 Volviendo desde selección de modos..."),typeof anime<"u"?anime({targets:this.container,opacity:[1,0],scale:[1,.9],duration:500,easing:"easeInExpo",complete:()=>{window.location.reload()}}):window.location.reload()}cleanup(){this.animationId&&cancelAnimationFrame(this.animationId),this.particleCanvas&&p.cleanup(this.particleCanvas),this.container&&this.container.remove(),this.container=null,this.particleCanvas=null}}class ${constructor(e,t){this.onCharactersSelected=e,this.gameMode=t,this.selectedCharacters={p1:null,p2:null},this.vfx=new x,this.characters=["Ryu","Ken"]}render(){const e=document.getElementById("gameCanvas");e&&(e.style.display="none");const t=document.createElement("div");t.className="scene-transition responsive-container",t.style.cssText=`
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, var(--dark-bg) 0%, #1a1a2e 50%, var(--dark-bg) 100%);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            font-family: 'Orbitron', sans-serif;
            perspective: 1000px;
            padding: var(--spacing-lg);
            overflow-x: hidden;
            overflow-y: auto;
        `,this.vfx.init();const a=document.createElement("h1");a.className="glitch-text",a.textContent="CHARACTER SELECT",a.style.cssText=`
            color: var(--primary-glow);
            font-size: var(--font-size-3xl);
            font-weight: 900;
            margin-bottom: var(--spacing-lg);
            text-align: center;
            text-shadow: 0 0 20px var(--primary-glow);
            letter-spacing: clamp(2px, 1vw, 4px);
            opacity: 0;
            transform: translateY(-50px);
        `,t.appendChild(a);const i=document.createElement("div");i.style.cssText=`
            display: grid;
            grid-template-columns: 1fr auto 1fr;
            grid-template-areas: "player1 vs player2";
            width: 100%;
            max-width: var(--container-xl);
            margin-top: var(--spacing-lg);
            gap: var(--spacing-md);
            align-items: center;
            justify-items: center;
        `,p.getDeviceType()==="mobile"&&(i.style.cssText=`
                display: flex;
                flex-direction: column;
                width: 100%;
                max-width: var(--container-sm);
                margin-top: var(--spacing-md);
                gap: var(--spacing-sm);
                align-items: center;
            `);const n=this.createPlayerSection("PLAYER 1","p1","--combat-blue"),s=this.createVSIndicator(),r=this.createPlayerSection(this.gameMode==="pvp"?"PLAYER 2":"CPU","p2","--combat-red");i.appendChild(n),i.appendChild(s),i.appendChild(r),t.appendChild(i);const o=this.createFightButton();return t.appendChild(o),document.body.appendChild(t),this.initializeAnimations(t,a,[n,r],o),setTimeout(()=>t.classList.add("active"),100),t}createPlayerSection(e,t,a){const i=document.createElement("div");i.className=t==="p1"?"slide-in-left":"slide-in-right",i.style.cssText=`
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: var(--spacing-lg);
            background: rgba(255, 255, 255, 0.05);
            border: 2px solid var(${a});
            border-radius: var(--border-radius-lg);
            margin: var(--spacing-sm);
            backdrop-filter: blur(10px);
            min-width: clamp(250px, 40vw, 300px);
            max-width: var(--container-sm);
            width: 100%;
            transform-style: preserve-3d;
            transition: all 0.5s ease;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        `;const n=document.createElement("h2");n.textContent=e,n.style.cssText=`
            color: var(${a});
            margin-bottom: var(--spacing-lg);
            font-size: var(--font-size-xl);
            font-family: 'Orbitron', sans-serif;
            font-weight: 700;
            text-shadow: 0 0 10px var(${a});
            text-align: center;
            letter-spacing: clamp(1px, 0.5vw, 2px);
        `,i.appendChild(n);const s=document.createElement("div");s.style.cssText=`
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(clamp(100px, 20vw, 120px), 1fr));
            gap: var(--spacing-md);
            perspective: 1000px;
            width: 100%;
        `,this.characters.forEach((o,l)=>{const c=this.createCharacterCard(o,t,a,l);s.appendChild(c)}),i.appendChild(s);const r=document.createElement("div");return r.id=`preview-${t}`,r.style.cssText=`
            margin-top: var(--spacing-md);
            padding: var(--spacing-md);
            border: 2px dashed transparent;
            border-radius: var(--border-radius-md);
            min-height: clamp(80px, 15vw, 100px);
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--text-color);
            font-size: var(--font-size-md);
            font-weight: 600;
            text-align: center;
            opacity: 0.7;
        `,r.textContent="Select a fighter",i.appendChild(r),i}createCharacterCard(e,t,a,i){const n=document.createElement("div");n.className="card-3d",n.dataset.character=e,n.dataset.player=t,n.style.cssText=`
            width: 120px;
            height: 160px;
            background: linear-gradient(45deg, #3a1c71, #d76d77, #ffaf7b);
            border-radius: 12px;
            color: white;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-size: 1.1rem;
            font-family: 'Orbitron', sans-serif;
            font-weight: 700;
            cursor: pointer;
            border: 3px solid transparent;
            transform-style: preserve-3d;
            transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
            position: relative;
            overflow: hidden;
            text-align: center;
            letter-spacing: 1px;
            text-shadow: 0 2px 5px rgba(0,0,0,0.5);
            opacity: 0;
            transform: translateY(30px) rotateX(15deg);
        `;const s=document.createElement("div");return s.className="char-name",s.textContent=e,s.innerHTML=s.textContent.replace(/\S/g,"<span style='display: inline-block; transition: all 0.3s ease;'>$&</span>"),n.appendChild(s),this.setupCardInteractions(n,t,e),n}setupCardInteractions(e,t,a){e.addEventListener("mouseenter",()=>{anime({targets:e,scale:1.1,rotateY:15,translateZ:25,boxShadow:"0 20px 40px rgba(0,0,0,0.4)",duration:400,easing:"easeOutExpo"}),anime({targets:e.querySelectorAll(".char-name span"),translateZ:[0,15],rotateY:()=>anime.random(-10,10),duration:500,delay:anime.stagger(50),easing:"easeOutExpo"})}),e.addEventListener("mouseleave",()=>{e.classList.contains("selected")||(anime({targets:e,scale:1,rotateY:0,translateZ:0,boxShadow:"0 10px 20px rgba(0,0,0,0.2)",duration:400,easing:"easeOutExpo"}),anime({targets:e.querySelectorAll(".char-name span"),translateZ:0,rotateY:0,duration:500,delay:anime.stagger(50,{direction:"reverse"}),easing:"easeOutExpo"}))}),e.addEventListener("click",i=>{this.selectCharacter(t,a,e,i)})}createVSIndicator(){const e=document.createElement("div");e.style.cssText=`
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        `;const t=document.createElement("div");return t.textContent="VS",t.style.cssText=`
            font-size: 4rem;
            font-weight: 900;
            color: var(--warning-glow);
            text-shadow: 0 0 20px var(--warning-glow);
            font-family: 'Orbitron', sans-serif;
            opacity: 0;
            transform: scale(0);
        `,e.appendChild(t),setTimeout(()=>{anime({targets:t,opacity:[0,1],scale:[0,1.2,1],rotate:[0,360],duration:1e3,easing:"easeOutElastic(1, .6)"})},800),e}createFightButton(){const e=document.createElement("button");return e.className="epic-button",e.textContent="READY TO FIGHT!",e.style.cssText=`
            font-family: 'Orbitron', monospace;
            font-weight: 900;
            font-size: 1.5rem;
            padding: 15px 40px;
            border: 3px solid var(--danger-glow);
            background: rgba(220, 38, 38, 0.2);
            color: var(--danger-glow);
            border-radius: 12px;
            cursor: pointer;
            margin-top: 40px;
            text-transform: uppercase;
            letter-spacing: 2px;
            transition: all 0.3s ease;
            opacity: 0.5;
            transform: translateY(50px);
            pointer-events: none;
            box-shadow: 0 0 20px rgba(220, 38, 38, 0.3);
        `,e.addEventListener("click",t=>{this.selectedCharacters.p1&&this.selectedCharacters.p2&&(this.vfx.screenShake(10),this.vfx.createParticleBurst(t.clientX,t.clientY,50,["#dc2626","#ffffff","#ffd700"]),anime({targets:e,scale:[1,.9,1.1],duration:300,easing:"easeInOutSine",complete:()=>{this.onCharactersSelected(this.selectedCharacters)}}))}),e}selectCharacter(e,t,a,i){this.vfx.createParticleBurst(i.clientX,i.clientY,20,["#00f2ff","#ff00c1"]);const n=document.querySelector(`[data-player="${e}"].selected`);n&&(n.classList.remove("selected"),anime({targets:n,borderColor:"transparent",scale:1,duration:300})),a.classList.add("selected"),this.selectedCharacters[e]=t,anime({targets:a,borderColor:e==="p1"?"var(--combat-blue)":"var(--combat-red)",scale:1.1,duration:400,easing:"easeOutExpo"});const s=document.getElementById(`preview-${e}`);if(s&&(s.textContent=`Selected: ${t}`,s.style.borderColor=e==="p1"?"var(--combat-blue)":"var(--combat-red)",s.style.color=e==="p1"?"var(--combat-blue)":"var(--combat-red)",anime({targets:s,scale:[1,1.05,1],duration:400,easing:"easeOutExpo"})),this.selectedCharacters.p1&&this.selectedCharacters.p2){const r=document.querySelector(".epic-button");r&&(r.style.pointerEvents="auto",anime({targets:r,opacity:[.5,1],translateY:[50,0],scale:[1,1.05,1],duration:600,easing:"easeOutExpo"}),anime({targets:r,boxShadow:["0 0 20px rgba(220, 38, 38, 0.3)","0 0 40px rgba(220, 38, 38, 0.8)","0 0 20px rgba(220, 38, 38, 0.3)"],duration:2e3,loop:!0,easing:"easeInOutSine"}))}}initializeAnimations(e,t,a,i){anime({targets:t,opacity:[0,1],translateY:[-50,0],duration:800,easing:"easeOutExpo",delay:200}),a.forEach((n,s)=>{const r=n.querySelectorAll(".card-3d");anime({targets:r,opacity:[0,1],translateY:[30,0],rotateX:[15,0],duration:600,easing:"easeOutExpo",delay:anime.stagger(100,{start:400+s*200})})}),setInterval(()=>{Math.random()>.8&&this.vfx.createGlitchEffect(t,500)},3e3)}init(){}update(e){}destroy(){this.vfx&&this.vfx.cleanup(),anime.remove(".card-3d"),anime.remove(".epic-button"),anime.remove(".char-name span");const e=document.querySelector(".scene-transition");e&&e.parentNode&&e.parentNode.removeChild(e)}}const J="modulepreload",_=function(h){return"/"+h},O={},z=function(e,t,a){let i=Promise.resolve();if(t&&t.length>0){let l=function(c){return Promise.all(c.map(d=>Promise.resolve(d).then(u=>({status:"fulfilled",value:u}),u=>({status:"rejected",reason:u}))))};var s=l;document.getElementsByTagName("link");const r=document.querySelector("meta[property=csp-nonce]"),o=r?.nonce||r?.getAttribute("nonce");i=l(t.map(c=>{if(c=_(c),c in O)return;O[c]=!0;const d=c.endsWith(".css"),u=d?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${c}"]${u}`))return;const m=document.createElement("link");if(m.rel=d?"stylesheet":J,d||(m.as="script"),m.crossOrigin="",m.href=c,o&&m.setAttribute("nonce",o),document.head.appendChild(m),d)return new Promise((f,v)=>{m.addEventListener("load",f),m.addEventListener("error",()=>v(new Error(`Unable to preload CSS for ${c}`)))})}))}function n(r){const o=new Event("vite:preloadError",{cancelable:!0});if(o.payload=r,window.dispatchEvent(o),!o.defaultPrevented)throw r}return i.then(r=>{for(const o of r||[])o.status==="rejected"&&n(o.reason);return e().catch(n)})};class T{static loadImage(e){return new Promise(t=>{console.log(`Intentando cargar la imagen desde: ${e}`);const a=new Image;a.crossOrigin="anonymous",a.onload=()=>{console.log(`Imagen cargada correctamente: ${e}`,{width:a.width,height:a.height,src:a.src}),t(a)},a.onerror=i=>{console.warn(`Advertencia: No se pudo encontrar el recurso de imagen [${e}]`),t(null)},a.src=e})}static loadSound(e){return new Promise(t=>{console.log(`Intentando cargar sonido desde: ${e}`);const a=new Audio;a.oncanplaythrough=()=>{console.log(`Sonido cargado correctamente: ${e}`),t(a)},a.onerror=i=>{console.warn(`Advertencia: No se pudo encontrar el recurso de sonido [${e}]`),t(null)},a.src=e})}static playSound(e){if(e&&e instanceof Audio)try{e.currentTime=0,e.play()}catch(t){console.warn("No se pudo reproducir el sonido:",t)}else console.warn("Advertencia: Intento de reproducir sonido inexistente")}static async loadAssets(e){const t={};for(const[a,i]of Object.entries(e))i.type==="image"?t[a]=await this.loadImage(i.url):i.type==="sound"&&(t[a]=await this.loadSound(i.url));return t}}class Q{init(){throw new Error("El método init() debe ser implementado por la subclase")}clear(){throw new Error("El método clear() debe ser implementado por la subclase")}drawSprite(e,t,a){throw new Error("El método drawSprite() debe ser implementado por la subclase")}drawRect(e,t,a,i,n){throw new Error("El método drawRect() debe ser implementado por la subclase")}drawText(e,t,a,i){throw new Error("El método drawText() debe ser implementado por la subclase")}resize(e,t){throw new Error("El método resize() debe ser implementado por la subclase")}}class Z extends Q{constructor(e="gameCanvas",t={}){super(),this.config={imageSmoothingEnabled:!1,debugMode:!1,enableResponsive:!0,...t},this.initializeCanvas(e),this.initializeState(),this.config.enableResponsive&&this.setupResponsive(),console.log(`✅ CanvasRenderer v2.0 inicializado correctamente con canvas '${e}'`)}initializeCanvas(e){if(this.canvas=document.getElementById(e),!this.canvas)throw new Error(`Canvas con ID '${e}' no encontrado en el DOM`);if(this.ctx=this.canvas.getContext("2d"),!this.ctx)throw new Error(`No se pudo obtener el contexto 2D del canvas '${e}'`);this.ctx.imageSmoothingEnabled=this.config.imageSmoothingEnabled}initializeState(){this.debugMode=this.config.debugMode,this.shakeOffset={x:0,y:0},this.isInitialized=!0}setupResponsive(){p.setupResponsiveCanvas(this.canvas)}init(){this.isInitialized||this.initializeState()}clear(){this.clearCanvas()}drawSprite(e,t,a){this.drawSpriteBasic(e,t,a)}drawRect(e,t,a,i,n){this.ctx.save(),this.ctx.translate(this.shakeOffset.x,this.shakeOffset.y),this.ctx.fillStyle=n,this.ctx.fillRect(e,t,a,i),this.ctx.restore()}drawText(e,t,a,i={}){this.ctx.save(),this.ctx.translate(this.shakeOffset.x,this.shakeOffset.y),this.ctx.font=i.font||"16px Arial",this.ctx.fillStyle=i.color||"white",this.ctx.textAlign=i.align||"left",this.ctx.textBaseline=i.baseline||"top",this.ctx.fillText(e,t,a),this.ctx.restore()}resize(e,t){this.canvas.width=e,this.canvas.height=t,this.ctx.imageSmoothingEnabled=this.config.imageSmoothingEnabled}clearCanvas(){this.ctx.save(),this.ctx.translate(this.shakeOffset.x,this.shakeOffset.y),this.ctx.fillStyle="black",this.ctx.fillRect(-this.shakeOffset.x,-this.shakeOffset.y,this.canvas.width,this.canvas.height),this.ctx.restore()}drawSpriteBasic(e,t,a,i=null,n=null,s=!1){if(this.ctx.save(),this.ctx.translate(this.shakeOffset.x,this.shakeOffset.y),s&&(this.ctx.scale(-1,1),t=-t-(i||64)),e&&e instanceof Image&&e.complete&&e.naturalWidth>0){const r=i||e.width,o=n||e.height;this.ctx.drawImage(e,t,a,r,o)}else{const r=i||64,o=n||64;this.drawPlaceholder(t,a,r,o)}this.ctx.restore()}drawSpriteFrame(e,t,a,i,n,s,r,o,l,c=!1){if(this.ctx.save(),this.ctx.translate(this.shakeOffset.x,this.shakeOffset.y),c&&(this.ctx.scale(-1,1),s=-s-o),!e||!(e instanceof Image)||!e.complete||e.naturalWidth===0){console.warn("Sprite no disponible para drawSpriteFrame"),this.drawPlaceholder(s,r,o,l),this.ctx.restore();return}if(t+i>e.width||a+n>e.height){console.error("Coordenadas fuera de límites:",{frame:`(${t}, ${a}, ${i}, ${n})`,sprite:`(${e.width}, ${e.height})`}),this.drawPlaceholder(s,r,o,l),this.ctx.restore();return}try{this.ctx.drawImage(e,t,a,i,n,s,r,o,l)}catch(d){console.error("Error al dibujar frame:",d),this.drawPlaceholder(s,r,o,l)}this.ctx.restore()}drawPlaceholder(e,t,a,i){this.ctx.save(),this.ctx.fillStyle="#ff00ff",this.ctx.globalAlpha=.7,this.ctx.fillRect(e,t,a,i),this.ctx.strokeStyle="#ffffff",this.ctx.lineWidth=2,this.ctx.globalAlpha=1,this.ctx.beginPath(),this.ctx.moveTo(e,t),this.ctx.lineTo(e+a,t+i),this.ctx.moveTo(e+a,t),this.ctx.lineTo(e,t+i),this.ctx.stroke(),this.ctx.restore()}drawDebugRect(e,t,a,i,n="rgba(0,255,0,0.4)",s=""){this.debugMode&&(this.ctx.save(),this.ctx.strokeStyle=n,this.ctx.fillStyle=n,this.ctx.lineWidth=2,this.ctx.strokeRect(e,t,a,i),s&&(this.ctx.fillStyle="#ffffff",this.ctx.font="12px Arial",this.ctx.fillText(s,e,t-5)),this.ctx.restore())}setDebugMode(e){this.debugMode=e}setScreenShakeOffset(e){this.shakeOffset=e}drawText(e,t,a,i={}){this.ctx.save(),this.ctx.translate(this.shakeOffset.x,this.shakeOffset.y),this.ctx.fillStyle=i.color||"#ffffff",this.ctx.font=i.font||"16px Arial",this.ctx.textAlign=i.align||"left",this.ctx.fillText(e,t,a),this.ctx.restore()}drawBackground(e,t=1200,a=600){if(this.ctx.save(),this.ctx.translate(this.shakeOffset.x,this.shakeOffset.y),e&&e instanceof Image&&e.complete&&e.naturalWidth>0)this.ctx.drawImage(e,0,0,t,a);else{const i=this.ctx.createLinearGradient(0,0,0,a);i.addColorStop(0,"#001122"),i.addColorStop(1,"#003366"),this.ctx.fillStyle=i,this.ctx.fillRect(0,0,t,a),this.ctx.fillStyle="rgba(255,255,255,0.3)",this.ctx.font="24px Arial",this.ctx.textAlign="center",this.ctx.fillText("BACKGROUND MISSING",t/2,a/2)}this.ctx.restore()}drawHealthBar(e,t,a,i,n,s,r="#ff0000"){const o=Math.max(0,n/s);this.ctx.save(),this.ctx.fillStyle="#333333",this.ctx.fillRect(e,t,a,i),this.ctx.fillStyle=r,this.ctx.fillRect(e,t,a*o,i),this.ctx.strokeStyle="#ffffff",this.ctx.lineWidth=2,this.ctx.strokeRect(e,t,a,i),this.ctx.restore()}applyScreenShake(e){e&&(e.x!==0||e.y!==0)&&(this.ctx.save(),this.ctx.translate(e.x,e.y))}resetScreenShake(){this.ctx.restore()}drawCharacterFrame(e,t,a,i,n=1,s=!0){if(!e||!t){console.error("Sprite o frameData inválidos:",{sprite:e,frameData:t}),this.drawPlaceholder(a,i,64*n,96*n);return}if(typeof t.x!="number"||typeof t.y!="number"||typeof t.width!="number"||typeof t.height!="number"){console.error("frameData incompleto:",t),this.drawPlaceholder(a,i,64*n,96*n);return}if(t.x+t.width>e.width||t.y+t.height>e.height){console.error("Coordenadas fuera de los límites del sprite:",{spriteSize:`${e.width}x${e.height}`,frameCoords:`${t.x},${t.y},${t.width},${t.height}`}),this.drawPlaceholder(a,i,64*n,96*n);return}const r=t.width*n,o=t.height*n;this.ctx.save();try{s?this.ctx.drawImage(e,t.x,t.y,t.width,t.height,a,i,r,o):(this.ctx.translate(a+r,i),this.ctx.scale(-1,1),this.ctx.drawImage(e,t.x,t.y,t.width,t.height,0,0,r,o))}catch(l){console.error("Error al dibujar:",l),this.drawPlaceholder(a,i,r,o)}this.ctx.restore()}}class ee{constructor(e,t="normal",a="allrounder"){this.character=e,this.difficulty=t,this.archetype=a,this.decisionTimer=0,this.currentState="neutral",this.lastAction=null,this.comboCounter=0,this.config=this.getDifficultyConfig(),this.opponentTracking={lastPosition:{x:0,y:0},velocity:{x:0,y:0},predictedPosition:{x:0,y:0}},console.log(`🤖 IA Mejorada v2.0 creada para ${e?.id||"unknown"}, dificultad: ${t}, arquetipo: ${a}`)}getDifficultyConfig(){switch(this.difficulty){case"easy":return{reactionTime:.4,accuracy:.6,aggressiveness:.3,predictionSkill:.2};case"normal":return{reactionTime:.2,accuracy:.8,aggressiveness:.6,predictionSkill:.5};case"hard":return{reactionTime:.1,accuracy:.95,aggressiveness:.9,predictionSkill:.8};default:return this.getDifficultyConfig()}}update(e,t){if(!this.character||!t){console.warn("⚠️ AIController: character u opponent no disponible");return}if(Math.random()<.02){const a=this.getDistanceToOpponent(t);console.log(`🤖 IA v2.0: state=${this.currentState}, distance=${a.toFixed(1)}, comboCounter=${this.comboCounter}`)}this.updateOpponentTracking(t,e),this.decisionTimer+=e,this.decisionTimer>=this.config.reactionTime&&(this.makeIntelligentDecision(t),this.decisionTimer=0)}updateOpponentTracking(e,t){const a=e.position.x-this.opponentTracking.lastPosition.x,i=e.position.y-this.opponentTracking.lastPosition.y;this.opponentTracking.velocity.x=a/t,this.opponentTracking.velocity.y=i/t;const n=this.config.predictionSkill*.5;this.opponentTracking.predictedPosition.x=e.position.x+this.opponentTracking.velocity.x*n,this.opponentTracking.predictedPosition.y=e.position.y+this.opponentTracking.velocity.y*n,this.opponentTracking.lastPosition.x=e.position.x,this.opponentTracking.lastPosition.y=e.position.y}makeIntelligentDecision(e){const t=this.getDistanceToOpponent(e),a=this.isOpponentVulnerable(e),i=this.canContinueCombo();!a&&this.comboCounter>0&&(this.comboCounter=0),i&&a?this.executeComboContinuation(e):this.shouldAttack(e,t)?this.executeOptimalAttack(e,t):this.shouldApproach(e,t)?this.executeApproachStrategy(e):this.shouldRetreat(e,t)?this.executeRetreatStrategy(e):this.executeNeutralStrategy(e,t)}getDistanceToOpponent(e){return Math.abs(this.character.position.x-e.position.x)}isOpponentVulnerable(e){return["lightPunch","hadoken","recovery","hitstun","blockstun"].includes(e.state)}canContinueCombo(){return this.comboCounter>0&&this.comboCounter<5&&this.lastAction!=="stop"}shouldAttack(e,t){const a=t<=80,i=this.isOpponentVulnerable(e),n=Math.random()<this.config.aggressiveness;return a&&(i||n)}shouldApproach(e,t){const a=t>120,i=!this.isOpponentThreatening(e);return a&&i}shouldRetreat(e,t){const a=t<40,i=this.character.health<this.character.maxHealth*.3,n=this.isOpponentThreatening(e);return a&&n||i}isOpponentThreatening(e){return["lightPunch","heavyPunch","hadoken","jump"].includes(e.state)}executeComboContinuation(e){this.currentState="attacking",this.comboCounter++;const t=["attack1","heavyPunch","attack1","projectile"],a=this.comboCounter%t.length,i=t[a];console.log(`🤖 IA continúa combo (${this.comboCounter}): ${i}`),this.executeAction(i)}executeOptimalAttack(e,t){this.currentState="attacking",this.comboCounter=1;let a;e.state==="jump"?a="antiair":t>60?a="projectile":t<50&&Math.random()<.4?a="heavyPunch":a="attack1",Math.random()>this.config.accuracy&&(a="attack1"),console.log(`🤖 IA ataca (distance=${t.toFixed(1)}): ${a}`),this.executeAction(a)}executeApproachStrategy(e){this.currentState="approaching";const t=this.opponentTracking.predictedPosition.x,a=this.character.position.x;let i;t>a+20?i="forward":t<a-20?i="back":i="stop",Math.random()<.15&&i==="forward"&&(i="jump"),console.log(`🤖 IA se acerca: ${i} (target=${t.toFixed(1)}, my=${a.toFixed(1)})`),this.executeAction(i)}executeRetreatStrategy(e){this.currentState="retreating";const t=e.position.x,a=this.character.position.x;let i;t>a?i="back":i="forward",Math.random()<.2&&(i="jump"),console.log(`🤖 IA se retira: ${i}`),this.executeAction(i)}executeNeutralStrategy(e,t){this.currentState="neutral";const a=[];t>100?a.push("forward","projectile"):t<60?a.push("back","down"):a.push("forward","back","stop"),Math.random()<.1&&a.push("jump");const i=a[Math.floor(Math.random()*a.length)];console.log(`🤖 IA neutral (distance=${t.toFixed(1)}): ${i}`),this.executeAction(i)}executeAction(e){this.lastAction=e,this.character.queueInput?this.character.queueInput(e):console.warn("⚠️ Character.queueInput no disponible")}}class R{constructor(e,t,a,i){this.playerIndex=e,this.playerId=`p${e}`,this.characterObj=t,this.inputManager=a,this.audioManager=i,this.isAI=!1,this.aiController=null}setAIController(e){this.isAI=!0,this.aiController=e}processInput(e){!this.characterObj||!e||(this.isAI?this.processAIInput(e):this.processHumanInput(e),this.updateOrientation(e))}processHumanInput(e){const t=["down","forward","punch"];if(this.inputManager.checkSequence(t,this.playerIndex-1)){if(this.characterObj.handleSpecialMove("hadoken")){const a=this.characterObj.isFacingRight?1:-1;this.onCreateProjectile?.("hadoken",this.playerId,this.characterObj.position,a),this.audioManager.playSound("hadoken")}return}if(this.playerIndex===2&&this.inputManager.isActionPressed(this.playerId,"special")){if(this.characterObj.handleSpecialMove("hadoken")){const a=this.characterObj.isFacingRight?1:-1;this.onCreateProjectile?.("hadoken",this.playerId,this.characterObj.position,a),this.audioManager.playSound("hadoken")}return}if(this.inputManager.isActionPressed(this.playerId,"up")){this.characterObj.performJump();return}if(this.inputManager.isActionPressed(this.playerId,"punch")){this.characterObj.performAttack("lightPunch");return}if(this.inputManager.isActionPressed(this.playerId,"right")){this.characterObj.moveForward();return}if(this.inputManager.isActionPressed(this.playerId,"left")){this.characterObj.moveBackward();return}this.characterObj.stopMovement()}update(e,t){this.isAI?this.processAIInput(t):this.processInput(t),this.updateOrientation(t)}processAIInput(e){this.aiController&&this.aiController.update(this.characterObj,e)}updateOrientation(e){!this.characterObj||!e||(e.position.x>this.characterObj.position.x?this.characterObj.isFacingRight=!0:this.characterObj.isFacingRight=!1)}setProjectileCallback(e){this.onCreateProjectile=e}getCharacterData(){return this.characterObj}isInUninterruptibleAnimation(){return this.characterObj?["lightPunch","hadoken","jump","knockout"].includes(this.characterObj.state):!1}}class te{constructor(e){this.renderer=e,this.canvas=e.canvas,this.ctx=e.ctx,this.vfx=new x,this.hudElements=null,this.animatedHealthValues={p1:100,p2:100},this.animatedSuperValues={p1:0,p2:0},this.lastDamageTime={p1:0,p2:0},this.isLowHealthWarning={p1:!1,p2:!1},this.isInitialized=!1,this.init()}init(){this.isInitialized||(this.vfx.init(),this.createHUDElements(),this.isInitialized=!0)}createHUDElements(){let e=document.getElementById("hud-container");e||(e=document.createElement("div"),e.id="hud-container",e.style.cssText=`
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 50;
                font-family: 'Orbitron', monospace;
            `,document.body.appendChild(e)),e.innerHTML="";const t=document.createElement("div");t.style.cssText=`
            position: absolute;
            top: 20px;
            left: 20px;
            right: 20px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 20px;
        `;const a=this.createPlayerSection("p1","left"),i=this.createTimerSection(),n=this.createPlayerSection("p2","right");t.appendChild(a),t.appendChild(i),t.appendChild(n),e.appendChild(t),this.hudElements={container:e,p1Section:a,p2Section:n,timerSection:i},this.addAnimationStyles()}createPlayerSection(e,t){const a=document.createElement("div");a.id=`hud-${e}`,a.style.cssText=`
            display: flex;
            flex-direction: column;
            gap: 10px;
            min-width: 300px;
            ${t==="right"?"align-items: flex-end;":""}
        `;const i=document.createElement("div");i.className="player-name hud-element",i.textContent=e.toUpperCase(),i.style.cssText=`
            color: ${e==="p1"?"var(--combat-blue)":"var(--combat-red)"};
            font-size: 1.2rem;
            font-weight: 700;
            text-shadow: 0 0 10px currentColor;
            margin-bottom: 5px;
            ${t==="right"?"text-align: right;":""}
        `;const n=document.createElement("div");n.style.cssText=`
            position: relative;
            width: 300px;
            height: 25px;
            ${t==="right"?"transform: scaleX(-1);":""}
        `;const s=document.createElement("div");s.style.cssText=`
            width: 100%;
            height: 100%;
            background: #333;
            border: 2px solid #555;
            border-radius: 12px;
            overflow: hidden;
            position: relative;
        `;const r=document.createElement("div");r.className="health-fill",r.id=`health-${e}`,r.style.cssText=`
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, var(--success-glow), var(--primary-glow));
            border-radius: 10px;
            transition: width 0.3s ease;
            position: relative;
            overflow: hidden;
        `;const o=document.createElement("div");o.style.cssText=`
            position: absolute;
            top: 0;
            left: -100%;
            width: 50%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
            animation: healthGlide 3s ease-in-out infinite;
        `;const l=document.createElement("div");l.className="damage-indicator",l.id=`damage-${e}`,l.style.cssText=`
            position: absolute;
            top: 0;
            right: 0;
            height: 100%;
            width: 0%;
            background: rgba(255, 255, 255, 0.7);
            transition: width 0.1s ease;
        `,r.appendChild(o),s.appendChild(r),s.appendChild(l),n.appendChild(s);const c=document.createElement("div");c.style.cssText=`
            position: relative;
            width: 300px;
            height: 15px;
            ${t==="right"?"transform: scaleX(-1);":""}
        `;const d=document.createElement("div");d.style.cssText=`
            width: 100%;
            height: 100%;
            background: #222;
            border: 1px solid var(--warning-glow);
            border-radius: 8px;
            overflow: hidden;
        `;const u=document.createElement("div");return u.id=`super-${e}`,u.style.cssText=`
            width: 0%;
            height: 100%;
            background: linear-gradient(90deg, var(--warning-glow), #ffff00);
            border-radius: 6px;
            transition: width 0.3s ease;
            box-shadow: 0 0 10px var(--warning-glow);
        `,d.appendChild(u),c.appendChild(d),a.appendChild(i),a.appendChild(n),a.appendChild(c),a}createTimerSection(){const e=document.createElement("div");e.style.cssText=`
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
        `;const t=document.createElement("div");t.id="timer-display",t.className="hud-element",t.textContent="90",t.style.cssText=`
            font-size: 3rem;
            font-weight: 900;
            color: var(--text-color);
            text-shadow: 0 0 15px currentColor;
            background: rgba(0,0,0,0.3);
            padding: 10px 20px;
            border-radius: 10px;
            border: 2px solid var(--border-color);
            min-width: 80px;
            text-align: center;
        `;const a=document.createElement("div");return a.id="round-display",a.className="hud-element",a.textContent="ROUND 1",a.style.cssText=`
            font-size: 1.2rem;
            font-weight: 700;
            color: var(--warning-glow);
            text-shadow: 0 0 10px var(--warning-glow);
            text-align: center;
        `,e.appendChild(t),e.appendChild(a),e}addAnimationStyles(){const e=document.createElement("style");e.textContent=`
            @keyframes healthGlide {
                0% { left: -100%; }
                50% { left: 100%; }
                100% { left: 100%; }
            }
            
            @keyframes superPulse {
                from { box-shadow: 0 0 10px var(--warning-glow); }
                to { box-shadow: 0 0 25px var(--warning-glow), 0 0 35px var(--warning-glow); }
            }
        `,document.head.appendChild(e)}render(e,t){this.isInitialized||this.init();const a=t||{characters:e,timer:90,status:"playing"};e&&e.length>=2&&(a.characters=e),this.updateHUD(a)}updateHUD(e){if(!e||!e.characters||e.characters.length<2)return;const t=e.characters[0],a=e.characters[1];this.updateHealthBar("p1",t.health,t.maxHealth),this.updateHealthBar("p2",a.health,a.maxHealth),this.updateSuperMeter("p1",t.superMeter||0),this.updateSuperMeter("p2",a.superMeter||0),this.updateTimer(e.timer),this.updatePlayerNames(t.name||"P1",a.name||"P2")}updateHealthBar(e,t,a){const i=Math.max(0,t/a*100),n=document.getElementById(`health-${e}`);if(document.getElementById(`damage-${e}`),!n)return;const s=this.animatedHealthValues[e];i<s&&this.triggerDamageEffect(e,s,i),anime({targets:this.animatedHealthValues,[e]:i,duration:500,easing:"easeOutCubic",update:()=>{n.style.width=this.animatedHealthValues[e]+"%",this.animatedHealthValues[e]<25?(n.style.background="linear-gradient(90deg, var(--danger-glow), #ff6b6b)",this.triggerLowHealthWarning(e)):this.animatedHealthValues[e]<50?n.style.background="linear-gradient(90deg, var(--warning-glow), #ffd93d)":n.style.background="linear-gradient(90deg, var(--success-glow), var(--primary-glow))"}})}updateSuperMeter(e,t){const a=document.getElementById(`super-${e}`);if(!a)return;const i=Math.min(100,t);i>=100&&this.animatedSuperValues[e]<100&&this.triggerSuperReadyEffect(e),anime({targets:this.animatedSuperValues,[e]:i,duration:300,easing:"easeOutCubic",update:()=>{a.style.width=this.animatedSuperValues[e]+"%",this.animatedSuperValues[e]>=100?a.style.animation="superPulse 1s ease-in-out infinite alternate":a.style.animation="none"}})}updateTimer(e){const t=document.getElementById("timer-display");t&&(t.textContent=Math.max(0,Math.floor(e)),e<=10&&e>0?(t.style.color="var(--danger-glow)",t.classList.contains("urgent-timer")||(t.classList.add("urgent-timer"),anime({targets:t,scale:[1,1.2,1],duration:800,loop:!0,easing:"easeInOutSine"}))):(t.style.color="var(--text-color)",t.classList.remove("urgent-timer"),anime.remove(t)))}updatePlayerNames(e,t){const a=document.querySelector("#hud-p1 .player-name"),i=document.querySelector("#hud-p2 .player-name");a&&(a.textContent=e.toUpperCase()),i&&(i.textContent=t.toUpperCase())}triggerDamageEffect(e,t,a){const i=document.getElementById(`damage-${e}`);if(!i)return;const n=t-a,s=document.getElementById(`hud-${e}`);s&&anime({targets:s,translateX:[0,-5,5,-3,3,0],duration:300,easing:"easeInOutSine"}),i.style.width=n+"%",anime({targets:i,width:"0%",duration:800,easing:"easeOutExpo",delay:200}),n>20&&this.vfx.screenShake(Math.min(15,n/5));const r=s.getBoundingClientRect();this.vfx.createParticleBurst(r.left+r.width/2,r.top+r.height/2,Math.min(30,n),["#ff4444","#ffaa44","#ffffff"])}triggerLowHealthWarning(e){if(this.isLowHealthWarning[e])return;this.isLowHealthWarning[e]=!0;const t=document.getElementById(`health-${e}`);t&&anime({targets:t,boxShadow:["0 0 10px var(--danger-glow)","0 0 25px var(--danger-glow)","0 0 10px var(--danger-glow)"],duration:1e3,loop:!0,easing:"easeInOutSine"}),setTimeout(()=>{this.isLowHealthWarning[e]=!1},5e3)}triggerSuperReadyEffect(e){const t=document.getElementById(`super-${e}`),a=document.getElementById(`hud-${e}`);if(t&&a){this.vfx.flashEffect(.3,200);const i=a.getBoundingClientRect();this.vfx.createParticleBurst(i.left+i.width/2,i.top+i.height,40,["#ffd700","#ffff00","#ffffff"]),anime({targets:t,scale:[1,1.1,1],duration:400,easing:"easeOutExpo"})}}triggerRoundStart(e){const t=document.getElementById("round-display");if(t){t.textContent=`ROUND ${e}`;const a=document.createElement("div");a.textContent="FIGHT!",a.style.cssText=`
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 6rem;
                font-weight: 900;
                color: var(--danger-glow);
                text-shadow: 0 0 30px var(--danger-glow);
                font-family: 'Orbitron', monospace;
                z-index: 200;
                opacity: 0;
                pointer-events: none;
            `,document.body.appendChild(a),anime.timeline().add({targets:a,opacity:[0,1],scale:[.5,1.2,1],duration:800,easing:"easeOutExpo"}).add({targets:a,opacity:[1,0],scale:[1,.8],duration:500,easing:"easeInExpo",complete:()=>a.remove()},"+=1000"),this.vfx.screenShake(10)}}triggerKO(e){const t=document.createElement("div");t.innerHTML="<span>K</span><span>.</span><span>O</span><span>.</span>",t.style.cssText=`
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 5rem;
            font-weight: 900;
            color: var(--danger-glow);
            text-shadow: 0 0 30px var(--danger-glow);
            font-family: 'Orbitron', monospace;
            z-index: 200;
            pointer-events: none;
        `;const a=t.querySelectorAll("span");a.forEach(i=>{i.style.display="inline-block",i.style.opacity="0",i.style.transform="scale(0)"}),document.body.appendChild(t),anime.timeline().add({targets:a,opacity:[0,1],scale:[0,1.2,1],duration:800,delay:anime.stagger(100),easing:"easeOutExpo"}).add({targets:t,scale:[1,1.1,1],duration:300,easing:"easeInOutSine"}).add({targets:t,opacity:[1,0],duration:1e3,easing:"easeInExpo",complete:()=>t.remove()},"+=2000"),this.vfx.createKOEffect(t)}draw(e){this.updateHUD(e)}destroy(){this.vfx&&this.vfx.cleanup();const e=document.getElementById("hud-container");e&&e.remove(),anime.remove("#timer-display"),anime.remove(".health-fill"),anime.remove(".player-name")}}class E{constructor(e,t,a,i,n,s=null){this.id=e,this.name=t,this.position=a,this.health=i,this.maxHealth=i,this.superMeter=n,this.maxSuperMeter=100,this.state="idle",this.velocity={x:0,y:0},this.isGrounded=!0,this.isFlipped=!1,this.isFacingRight=!0,this.currentFrameIndex=0,this.frameTimer=0,this.attackHasHit=!1,this.config=s||this.getDefaultConfig(),this.animations=this.config.animations||{},this.specialMoves=this.config.specialMoves||[],this.superAttacks=this.config.superAttacks||[],this.stats=this.config.stats||this.getDefaultStats(),console.log(`🦸 Character ${e} (${t}) constructor:`,{hasConfig:!!s,animationsCount:Object.keys(this.animations).length,idleFrames:this.animations.idle?this.animations.idle.frames.length:0,frameRate:this.animations.idle?this.animations.idle.frameRate:"N/A"}),this.inputQueue=[]}getDefaultConfig(){return{animations:{idle:{frames:[{x:0,y:0,width:64,height:96,type:"active",duration:12}],frameRate:8,loop:!0}},specialMoves:[],superAttacks:[]}}getDefaultStats(){return{speed:80,jumpForce:-400,gravity:800,superMeterGainOnHit:10,superMeterGainOnBlock:5,superMeterGainOnTakeDamage:7}}update(e,t=null,a=null){Math.random()<.005&&console.log(`🦸 Character.update: ${this.id}, deltaTime=${e.toFixed(4)}s, estado=${this.state}`),this.processAIInput(),this.applyPhysics(e),this.processAnimation(e),t&&this.updateFacingDirection(t)}processAIInput(){if(this.inputQueue.length>0){const e=this.inputQueue.shift();this.processInput(e)}}updateFacingDirection(e){this.isFacingRight=e.position.x>this.position.x,this.isFlipped=!this.isFacingRight}applyPhysics(e){this.isGrounded||(this.velocity.y+=this.stats.gravity*e),this.position.x+=this.velocity.x*e,this.position.y+=this.velocity.y*e,this.handleGroundCollision(300),this.handleScreenBounds(),this.velocity.x*=.95,Math.abs(this.velocity.x)<.1&&(this.velocity.x=0)}handleGroundCollision(e){this.position.y>=e?(this.position.y=e,this.isGrounded=!0,this.velocity.y=0,this.state==="jump"&&this.changeState("idle")):this.isGrounded=!1}handleScreenBounds(){const e=document.getElementById("gameCanvas");if(!e)return;const t=0,a=e.width-128;this.position.x<t?(this.position.x=t,this.velocity.x=0):this.position.x>a&&(this.position.x=a,this.velocity.x=0)}processAnimation(e){const t=this.animations[this.state];if(!t||!t.frames||t.frames.length===0){console.warn(`⚠️ Character ${this.id}: No hay animación para estado ${this.state}`);return}const a=t.frames[this.currentFrameIndex];if(!a){console.warn(`⚠️ Character ${this.id}: No hay frame ${this.currentFrameIndex} en estado ${this.state}`);return}Math.random()<.005&&console.log(`🎭 ${this.id}: deltaTime=${e.toFixed(4)}s, estado=${this.state}, frame=${this.currentFrameIndex}, timer=${this.frameTimer.toFixed(3)}s`),this.frameTimer+=e,this.processFrameData(a),this.advanceFrameIfNeeded(t)}processFrameData(e){e.type==="active"&&!this.attackHasHit&&this.activateHitbox(e)}advanceFrameIfNeeded(e){const t=e.frameRate||10;e.frames[this.currentFrameIndex].duration;const a=1/t;Math.random()<.02&&console.log(`⏱️ ${this.id} timing: frameRate=${t}, timePerFrame=${a.toFixed(3)}s, timer=${this.frameTimer.toFixed(3)}s, currentFrame=${this.currentFrameIndex}, shouldAdvance=${this.frameTimer>=a}`),this.frameTimer>=a&&(this.frameTimer-=a,this.currentFrameIndex++,console.log(`🎞️ ${this.id} avanza frame: ${this.currentFrameIndex-1} → ${this.currentFrameIndex} en estado: ${this.state}`),this.currentFrameIndex>=e.frames.length&&this.handleAnimationEnd(e))}handleAnimationEnd(e){e.loop?this.currentFrameIndex=0:(this.currentFrameIndex=0,this.attackHasHit=!1,this.changeState(e.onEnd||"idle"))}changeState(e){this.state!==e&&(this.state=e,this.currentFrameIndex=0,this.frameTimer=0,this.attackHasHit=!1)}activateHitbox(e){e.hitbox&&!this.attackHasHit&&console.log(`${this.name} activa hitbox:`,e.hitbox)}processInput(e){switch(e){case"forward":this.moveForward();break;case"back":this.moveBackward();break;case"attack1":this.performAttack("lightPunch");break;case"attack2":this.performAttack("heavyPunch");break;case"jump":this.performJump();break;case"stop":this.stopMovement();break;case"antiair":this.performAntiAir();break;case"combo":this.performComboAttack();break;case"projectile":this.performProjectile();break;case"heavyPunch":this.performAttack("heavyPunch");break;case"down":this.crouch();break;default:Math.random()<.01&&console.warn(`⚠️ Acción desconocida: ${e}`);break}}performAntiAir(){if(this.canAttack()){this.velocity.x=0,this.attackHasHit=!1;const e=this.config.animations.antiAir?"antiAir":"lightPunch";return this.changeState(e),!0}return!1}performComboAttack(){if(this.canAttack()){this.velocity.x=0,this.attackHasHit=!1;const e=["lightPunch","heavyPunch"],t=e[Math.floor(Math.random()*e.length)];return this.changeState(t),!0}return!1}performProjectile(){return this.canAttack()&&this.config.animations.hadoken?(this.velocity.x=0,this.attackHasHit=!1,this.changeState("hadoken"),!0):!1}crouch(){if(this.canMove()&&this.isGrounded){this.velocity.x=0;const e=this.config.animations.crouch?"crouch":"idle";return this.changeState(e),!0}return!1}moveForward(){this.canMove()&&(this.velocity.x=this.stats.speed,this.changeState("walkForward"))}moveBackward(){this.canMove()&&(this.velocity.x=-this.stats.speed,this.changeState("walkBackward"))}performAttack(e="lightPunch"){return this.canAttack()?(this.velocity.x=0,this.attackHasHit=!1,this.changeState(e),!0):!1}performJump(){return this.canJump()?(this.velocity.y=this.stats.jumpForce,this.velocity.x=0,this.isGrounded=!1,this.changeState("jump"),!0):!1}stopMovement(){this.canMove()&&(this.velocity.x=0,this.changeState("idle"))}canMove(){return!["lightPunch","hadoken","jump","knockedOut"].includes(this.state)}canAttack(){return!["lightPunch","hadoken","jump","knockedOut"].includes(this.state)}canJump(){return this.isGrounded&&this.state!=="jump"&&this.state!=="knockedOut"}queueInput(e){this.inputQueue.push(e)}takeDamage(e){return this.health=Math.max(0,this.health-e),this.gainSuperMeter(this.stats.superMeterGainOnTakeDamage),this.health<=0&&this.changeState("knockedOut"),this.health<=0}gainSuperMeter(e){this.superMeter=Math.min(this.maxSuperMeter,this.superMeter+e)}canUseSuperAttack(e=100){return this.superMeter>=e}useSuperMeter(e){return this.superMeter>=e?(this.superMeter-=e,!0):!1}reset(){this.health=this.maxHealth,this.superMeter=0,this.position={x:this.id==="p1"?200:800,y:300},this.velocity={x:0,y:0},this.isGrounded=!0,this.attackHasHit=!1,this.inputQueue=[],this.isFacingRight=this.id==="p1",this.isFlipped=!this.isFacingRight,this.changeState("idle"),console.log(`🔄 ${this.name} reseteado completamente`)}getInfo(){return{id:this.id,name:this.name,health:this.health,maxHealth:this.maxHealth,superMeter:this.superMeter,state:this.state,position:{...this.position},isGrounded:this.isGrounded}}serialize(){return{id:this.id,name:this.name,position:{...this.position},velocity:{...this.velocity},health:this.health,maxHealth:this.maxHealth,superMeter:this.superMeter,state:this.state,currentFrameIndex:this.currentFrameIndex,frameTimer:this.frameTimer,isGrounded:this.isGrounded,isFlipped:this.isFlipped,isFacingRight:this.isFacingRight,attackHasHit:this.attackHasHit}}static deserialize(e,t=null){const a=new E(e.id,e.name,e.position,e.maxHealth,e.superMeter,t);return a.health=e.health,a.velocity=e.velocity,a.state=e.state,a.currentFrameIndex=e.currentFrameIndex,a.frameTimer=e.frameTimer,a.isGrounded=e.isGrounded,a.isFlipped=e.isFlipped,a.isFacingRight=e.isFacingRight,a.attackHasHit=e.attackHasHit,a}}class D{constructor(e,t=null){this.gameManager=t,this.battleConfig=this.validateBattleConfig(e),this.p1Character=this.battleConfig.p1,this.p2Character=this.battleConfig.p2,this.gameMode=this.battleConfig.gameMode,this.characterData=this.loadCharacterData(),this.renderer=null,this.inputManager=null,this.hud=null,this.audioManager=null,this.characters=[],this.controllers=[],this.assets={sprites:new Map,sounds:new Map,background:null},this.renderState={animationFrameId:null,lastFrameTime:0,isRunning:!1,showDebug:!1,showControls:!1},this.visualEffects={projectiles:[],hitEffects:[],particles:[]},this.hitCooldowns=new Map}validateBattleConfig(e){if(!e||!e.p1||!e.p2)throw new Error("Configuración de batalla inválida");return e}loadCharacterData(){const e=w.characters.find(a=>a.name===this.p1Character),t=w.characters.find(a=>a.name===this.p2Character);if(!e||!t)throw new Error(`Personajes no encontrados: P1:${this.p1Character} P2:${this.p2Character}`);return{p1:e,p2:t}}async init(){console.log("🎮 Inicializando BattleScene v2.0...");try{await this.loadAssets(),this.initializePresentationSystems(),this.createDomainObjects(),this.setupControllers(),this.registerWithGameManager(),console.log("✅ BattleScene v2.0 inicializada correctamente")}catch(e){throw console.error("❌ Error inicializando BattleScene:",e),e}}async loadAssets(){console.log("📦 Cargando assets...");try{const[e,t]=await Promise.all([this.loadCharacterConfig(this.characterData.p1),this.loadCharacterConfig(this.characterData.p2)]),[a,i,n]=await Promise.all([T.loadImage(this.characterData.p1.spriteSheetUrl),T.loadImage(this.characterData.p2.spriteSheetUrl),this.loadStageBackground()]);this.assets.sprites.set("p1",{image:a,config:e}),this.assets.sprites.set("p2",{image:i,config:t}),this.assets.background=n,console.log("✅ Assets cargados correctamente")}catch(e){throw console.error("❌ Error cargando assets:",e),e}}async loadCharacterConfig(e){try{console.log(`🔧 Intentando cargar config de ${e.name} desde: ${e.configPath}`);let t;if(e.name==="Ken")t=await z(()=>import("./KenBase-DDDQL35A.js"),[]);else if(e.name==="Ryu")t=await z(()=>import("./RyuBase-BuEjqbD5.js"),[]);else throw new Error(`Personaje no soportado: ${e.name}`);return console.log(`✅ Config de ${e.name} cargada correctamente:`,t.default),t.default}catch(t){return console.warn(`⚠️ No se pudo cargar config para ${e.name}, usando valores por defecto. Error:`,t),this.getDefaultCharacterConfig()}}getDefaultCharacterConfig(){return{animations:{idle:{frames:[{x:0,y:0,width:64,height:96,type:"active",duration:12}],frameRate:8,loop:!0}},stats:{health:1e3,speed:80,jumpForce:-400},specialMoves:[],superAttacks:[]}}async loadStageBackground(){const e=w.stages.find(t=>t.enabled)||w.stages[0];return e&&e.backgroundUrl?await T.loadImage(e.backgroundUrl):null}initializePresentationSystems(){console.log("🔧 Inicializando sistemas de presentación..."),this.renderer=new Z("gameCanvas"),this.inputManager=new B,this.inputManager.init(),this.hud=new te(this.renderer),this.vfx=new x,this.vfx.init(),this.audioManager=new H,this.audioManager.init().catch(e=>console.warn("⚠️ AudioManager falló, continuando sin sonido:",e)),console.log("✅ Sistemas de presentación inicializados")}createDomainObjects(){console.log("👥 Creando objetos de dominio...");const e=this.assets.sprites.get("p1").config,t=this.assets.sprites.get("p2").config,a=new E("p1",this.p1Character,{x:200,y:300},this.characterData.p1.health,0,e),i=new E("p2",this.p2Character,{x:800,y:300},this.characterData.p2.health,0,t);this.characters=[a,i],this.gameManager&&(this.gameManager.addCharacterToGameState(a),this.gameManager.addCharacterToGameState(i)),console.log("✅ Objetos de dominio creados")}setupControllers(){console.log("🎮 Configurando controladores..."),console.log(`🎯 Modo de juego detectado: '${this.gameMode}'`);const e=new R(1,this.characters[0],this.inputManager,this.audioManager);let t;this.gameMode==="vs-ai"||this.gameMode==="cpu"?(t=new ee(this.characters[1],"normal"),console.log("🤖 Configurando AIController para jugador 2")):(t=new R(2,this.characters[1],this.inputManager,this.audioManager),console.log("👤 Configurando PlayerController para jugador 2")),this.controllers=[e,t],console.log("✅ Controladores configurados")}registerWithGameManager(){console.log("🔍 registerWithGameManager - GameManager existe:",!!this.gameManager),console.log("🔍 GameManager.registerBattleScene existe:",this.gameManager&&typeof this.gameManager.registerBattleScene=="function"),console.log("🔍 GameManager.startGame existe:",this.gameManager&&typeof this.gameManager.startGame=="function"),this.gameManager&&typeof this.gameManager.registerBattleScene=="function"?(this.gameManager.registerBattleScene(this),console.log("🔗 BattleScene registrada en GameManager"),typeof this.gameManager.startGame=="function"?(this.gameManager.startGame(),console.log("🚀 GameManager iniciado para procesar updates")):console.error("❌ GameManager.startGame no existe!")):console.error("❌ GameManager o registerBattleScene no disponible!")}render(){if(!this.renderer){console.warn("⚠️ Renderer no inicializado");return}const e=document.getElementById("gameCanvas");e&&(e.style.display="block",p.setupResponsiveCanvas(e)),this.startGameLoop()}startGameLoop(){if(this.renderState.isRunning){console.warn("⚠️ GameLoop ya está corriendo");return}this.renderState.isRunning=!0,this.renderState.lastFrameTime=performance.now(),console.log("🎬 Iniciando gameloop de renderizado"),this.gameLoop()}gameLoop(e=performance.now()){if(!this.renderState.isRunning)return;const t=Math.min((e-this.renderState.lastFrameTime)/1e3,.016);this.renderState.lastFrameTime=e,this.updatePresentationLayer(t),this.gameManager&&typeof this.gameManager.updateGameState=="function"?(Math.random()<.005&&console.log(`🎮 BattleScene llamando GameManager.updateGameState con deltaTime=${t.toFixed(4)}s`),this.gameManager.updateGameState(t)):Math.random()<.01&&console.warn("⚠️ GameManager no disponible o updateGameState no existe"),this.renderFrame(),this.renderState.animationFrameId=requestAnimationFrame(a=>this.gameLoop(a))}updatePresentationLayer(e){this.updateControllers(e),this.updateVisualEffects(e),b.update()}updateControllers(e){this.controllers.forEach((t,a)=>{const i=this.characters[1-a];t.update(e,i)})}updateVisualEffects(e){this.visualEffects.projectiles=this.visualEffects.projectiles.filter(t=>(t.x+=t.speed*e,t.life-=e,t.life>0)),this.visualEffects.hitEffects=this.visualEffects.hitEffects.filter(t=>(t.life-=e,t.life>0)),this.visualEffects.particles=this.visualEffects.particles.filter(t=>(t.x+=t.vx*e,t.y+=t.vy*e,t.life-=e,t.life>0))}renderFrame(){this.renderer.clearCanvas();const e=b.getScreenShakeOffset();(e.x!==0||e.y!==0)&&this.renderer.setScreenShakeOffset(e),this.renderBackground(),this.renderCharacters(),this.renderVisualEffects(),this.renderHUD(),this.renderState.showDebug&&this.renderDebugInfo()}renderBackground(){if(this.assets.background)this.renderer.drawBackground(this.assets.background);else{const e=this.renderer.ctx;e.fillStyle="#1a1a2e",e.fillRect(0,0,1200,600)}}renderCharacters(){this.characters.forEach((e,t)=>{const a=t===0?"p1":"p2",i=this.assets.sprites.get(a);i&&i.image&&i.config?this.renderCharacter(e,i.image,i.config):this.renderer.drawPlaceholder(e.position.x,e.position.y,64,96)})}renderCharacter(e,t,a){const i=a.animations[e.state];if(!i||!i.frames){console.warn(`⚠️ No hay animación para el estado: ${e.state}`);return}const n=i.frames[e.currentFrameIndex];if(!n){console.warn(`⚠️ No hay frame en índice: ${e.currentFrameIndex} para estado: ${e.state}`);return}if(performance.now()%1e3<16&&console.log(`🎬 Renderizando: ${e.name} estado=${e.state} frame=${e.currentFrameIndex}/${i.frames.length-1}`),this.renderer.drawSpriteFrame(t,n.x,n.y,n.width,n.height,e.position.x,e.position.y,n.width*2,n.height*2,e.isFlipped),this.renderState.showDebug&&n.hitbox){const s=n.hitbox;this.renderer.drawDebugRect(e.position.x+s.x,e.position.y+s.y,s.w,s.h,"rgba(255,0,0,0.5)","hitbox")}}renderVisualEffects(){const e=this.renderer.ctx;this.visualEffects.projectiles.forEach(t=>{e.fillStyle=t.color||"yellow",e.fillRect(t.x,t.y,20,10)}),this.visualEffects.hitEffects.forEach(t=>{e.fillStyle=`rgba(255,255,0,${t.life})`,e.fillRect(t.x-10,t.y-10,20,20)}),b.drawParticles(e)}renderHUD(){if(!this.hud)return;let e=null;this.gameManager&&typeof this.gameManager.getGameState=="function"&&(e=this.gameManager.getGameState()),this.hud.render(this.characters,e)}renderDebugInfo(){const e=this.renderer.ctx;e.fillStyle="white",e.font="14px monospace";let t=20;if(this.characters.forEach((a,i)=>{e.fillText(`P${i+1}: ${a.state} Frame:${a.currentFrameIndex} HP:${a.health}`,10,t),t+=20}),e.fillText(`Visual Effects: ${this.visualEffects.projectiles.length+this.visualEffects.hitEffects.length}`,10,t),t+=20,this.gameManager){const a=this.gameManager.getMetrics();e.fillText(`Game Frame: ${a.currentFrame}`,10,t)}}createVisualProjectile(e,t,a,i={}){this.visualEffects.projectiles.push({x:e,y:t,speed:(i.speed||300)*a,life:i.life||3,color:i.color||"yellow"})}createVisualHitEffect(e,t,a=10){this.visualEffects.hitEffects.push({x:e,y:t,life:.3});const i=Math.min(a/5,15);this.vfx.screenShake(i),this.vfx.createParticleBurst(e,t,a*2,["#ff4444","#ffaa44","#ffffff","#ffd700"]),a>15&&this.vfx.createShockwave(e,t,a*5),a>20&&this.vfx.flashEffect(.4,200),b.triggerScreenShake(5,100),b.createParticles({x:e,y:t,count:8,color:"orange",life:20,speed:100})}onRoundReset(){this.visualEffects.projectiles=[],this.visualEffects.hitEffects=[],this.visualEffects.particles=[],this.hitCooldowns.clear(),console.log("🔄 BattleScene: Ronda reiniciada")}onMatchReset(){this.onRoundReset(),console.log("🆕 BattleScene: Match reiniciado")}onRoundStart(e=1){this.vfx&&(this.vfx.createShockwave(400,300,300),this.vfx.flashEffect(.5,300)),this.hud&&this.hud.triggerRoundStart&&this.hud.triggerRoundStart(e),console.log(`⚔️ ¡ROUND ${e} START!`)}onPlayerKO(e,t){if(this.vfx){const a=this.characters[e];a&&(this.vfx.createKOEffect(a.position.x,a.position.y),this.vfx.screenShake(20),this.vfx.flashEffect(.8,500))}this.hud&&this.hud.triggerKO&&this.hud.triggerKO(`p${e+1}`),console.log(`💀 Player ${e+1} KO! Winner: Player ${t+1}`)}onSuperMeterFull(e){if(this.vfx){const t=this.characters[e];t&&(this.vfx.createPowerUpEffect(t.position.x,t.position.y),this.vfx.flashEffect(.3,200))}console.log(`⚡ Player ${e+1} SUPER READY!`)}onSpecialMove(e,t){if(this.vfx){const a=this.characters[e];a&&(this.vfx.createShockwave(a.position.x,a.position.y,200),this.vfx.createParticleBurst(a.position.x,a.position.y,50,["#00f2ff","#ff00c1","#ffff00"]))}console.log(`🔥 Player ${e+1} usa ${t}!`)}toggleDebug(){this.renderState.showDebug=!this.renderState.showDebug,this.renderer&&this.renderer.setDebugMode(this.renderState.showDebug)}stopGameLoop(){this.renderState.isRunning=!1,this.renderState.animationFrameId&&(cancelAnimationFrame(this.renderState.animationFrameId),this.renderState.animationFrameId=null),console.log("🛑 GameLoop detenido")}cleanup(){console.log("🧹 Limpiando BattleScene v2.0..."),this.stopGameLoop(),this.inputManager&&typeof this.inputManager.cleanup=="function"&&this.inputManager.cleanup(),this.audioManager&&typeof this.audioManager.cleanup=="function"&&this.audioManager.cleanup(),this.vfx&&typeof this.vfx.cleanup=="function"&&this.vfx.cleanup(),this.hud&&typeof this.hud.destroy=="function"&&this.hud.destroy(),this.gameManager&&typeof this.gameManager.unregisterBattleScene=="function"&&this.gameManager.unregisterBattleScene(),this.characters=[],this.controllers=[],this.assets.sprites.clear(),this.assets.sounds.clear(),this.visualEffects.projectiles=[],this.visualEffects.hitEffects=[],this.visualEffects.particles=[],this.hitCooldowns.clear();const e=document.getElementById("gameCanvas");e&&(e.style.display="none"),console.log("✅ BattleScene v2.0 limpiada")}}class ae{constructor(e){console.log("🎉 VictoryScene constructor llamado con:",e),this.gameManager=window.appController?.gameManager||null,this.renderer=this.gameManager?.renderer||null,this.canvas=this.renderer?.canvas,this.ctx=this.renderer?.ctx,this.initialized=!1,this.selectedOption=0,this.options=["Nueva Batalla","Menú Principal"],e&&typeof e=="object"&&e.winner!==void 0?(this.winnerData=e,this.initialized=!0,console.log("🎉 VictoryScene inicializada con datos del constructor")):this.winnerData=null,console.log("🎉 VictoryScene creada, initialized:",this.initialized)}init(e){e&&(this.winnerData=e),!this.renderer&&this.gameManager?.renderer&&(this.renderer=this.gameManager.renderer,this.canvas=this.renderer.canvas,this.ctx=this.renderer.ctx),this.initialized=!0,console.log("🎉 VictoryScene inicializada con:",this.winnerData)}update(e,t){!this.initialized||!t||((t.keys.ArrowUp||t.keys.w)&&(this.selectedOption=Math.max(0,this.selectedOption-1),t.keys.ArrowUp=!1,t.keys.w=!1),(t.keys.ArrowDown||t.keys.s)&&(this.selectedOption=Math.min(this.options.length-1,this.selectedOption+1),t.keys.ArrowDown=!1,t.keys.s=!1),(t.keys.Enter||t.keys[" "])&&(this.selectOption(),t.keys.Enter=!1,t.keys[" "]=!1))}selectOption(){console.log("🎮 Opción seleccionada:",this.selectedOption);const e=this.sceneManager||this.gameManager?.sceneManager||window.appController?.sceneManager;if(!e){console.warn("⚠️ SceneManager no encontrado, recargando página como fallback"),window.location.reload();return}switch(this.selectedOption){case 0:console.log("🔄 Iniciando nueva batalla..."),e.transitionTo("characterSelect");break;case 1:console.log("🏠 Volviendo al menú principal..."),e.transitionTo("title");break}}render(){if(!this.initialized||!this.winnerData){console.warn("⚠️ VictoryScene.render: Escena no inicializada o sin datos");return}if((!this.ctx||!this.canvas)&&(console.warn("⚠️ VictoryScene.render: Canvas o contexto no disponible"),this.setupCanvasFromDOM(),!this.ctx||!this.canvas)){console.error("❌ VictoryScene: No se pudo obtener canvas"),this.handleRenderError();return}try{this.ctx.fillStyle="#000015",this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height),this.drawBackground(),this.drawVictoryTitle(),this.drawWinnerInfo(),this.drawScoreInfo(),this.drawMenuOptions(),this.drawInstructions()}catch(e){console.error("❌ Error renderizando VictoryScene:",e),this.handleRenderError()}}setupCanvasFromDOM(){try{this.canvas=document.getElementById("gameCanvas"),this.canvas&&(this.ctx=this.canvas.getContext("2d"),console.log("✅ VictoryScene: Canvas configurado desde DOM"))}catch(e){console.error("❌ Error configurando canvas desde DOM:",e)}}handleRenderError(){document.body.innerHTML=`
            <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: #ffffff; font-family: Arial, sans-serif; text-align: center;">
                <div style="background: rgba(0, 0, 0, 0.3); border-radius: 15px; padding: 40px; max-width: 600px;">
                    <h1 style="color: #ffaa00; font-size: 48px; margin-bottom: 20px;">🏆 ${this.winnerData.winnerName||"Ganador"} GANA!</h1>
                    <p style="font-size: 24px; margin: 20px 0;">Razón: ${this.winnerData.winReason||"Victoria"}</p>
                    <p style="font-size: 20px; margin: 20px 0;">Puntuación: P1: ${this.winnerData.scores?.p1||0} - P2: ${this.winnerData.scores?.p2||0}</p>
                    <div style="margin-top: 30px;">
                        <button onclick="window.location.reload()" style="background: #4CAF50; color: white; border: none; padding: 15px 30px; border-radius: 5px; cursor: pointer; font-size: 18px; margin: 10px;">🔄 Nueva Batalla</button>
                        <button onclick="window.location.reload()" style="background: #2196F3; color: white; border: none; padding: 15px 30px; border-radius: 5px; cursor: pointer; font-size: 18px; margin: 10px;">🏠 Menú Principal</button>
                    </div>
                </div>
            </div>
        `}drawBackground(){const e=this.ctx.createRadialGradient(this.canvas.width/2,this.canvas.height/2,0,this.canvas.width/2,this.canvas.height/2,this.canvas.width);this.winnerData.winner==="draw"?(e.addColorStop(0,"#1a1a2e"),e.addColorStop(1,"#16213e")):(e.addColorStop(0,"#2d1b69"),e.addColorStop(1,"#0f0f23")),this.ctx.fillStyle=e,this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height)}drawVictoryTitle(){this.ctx.save(),this.ctx.shadowColor="rgba(255, 170, 0, 0.8)",this.ctx.shadowBlur=20,this.ctx.shadowOffsetX=3,this.ctx.shadowOffsetY=3,this.ctx.fillStyle="#ffaa00",this.ctx.font="bold 64px Arial",this.ctx.textAlign="center",this.ctx.fillText("VICTORIA!",this.canvas.width/2,120),this.ctx.restore()}drawWinnerInfo(){this.ctx.save();let e="",t="";this.winnerData.winner==="draw"?(e="EMPATE!",t="Tiempo agotado"):(e=`${this.winnerData.winnerName||"Ganador"} GANA!`,t=this.winnerData.winReason||"Victory"),this.ctx.fillStyle="#ffffff",this.ctx.font="bold 36px Arial",this.ctx.textAlign="center",this.ctx.fillText(e,this.canvas.width/2,200),this.ctx.fillStyle="#cccccc",this.ctx.font="24px Arial",this.ctx.fillText(t,this.canvas.width/2,240),this.ctx.restore()}drawScoreInfo(){this.ctx.save();const e=this.winnerData.scores||{p1:0,p2:0},t=this.winnerData.p1Name||"Player 1",a=this.winnerData.p2Name||"Player 2";this.ctx.fillStyle="#ffaa00",this.ctx.font="bold 28px Arial",this.ctx.textAlign="center",this.ctx.fillText("PUNTUACIÓN FINAL",this.canvas.width/2,320),this.ctx.fillStyle="#ffffff",this.ctx.font="24px Arial",this.ctx.textAlign="left";const i=360,n=this.canvas.width/2-150;this.ctx.fillText(`${t}: ${e.p1}`,n,i),this.ctx.textAlign="right";const s=this.canvas.width/2+150;this.ctx.fillText(`${a}: ${e.p2}`,s,i),this.ctx.restore()}drawMenuOptions(){this.ctx.save(),this.ctx.fillStyle="#ffaa00",this.ctx.font="bold 24px Arial",this.ctx.textAlign="center",this.ctx.fillText("¿QUÉ DESEAS HACER?",this.canvas.width/2,450),this.options.forEach((e,t)=>{const a=500+t*50,i=t===this.selectedOption;i&&(this.ctx.fillStyle="rgba(255, 170, 0, 0.3)",this.ctx.fillRect(this.canvas.width/2-150,a-30,300,40)),this.ctx.fillStyle=i?"#ffaa00":"#ffffff",this.ctx.font=i?"bold 24px Arial":"20px Arial",this.ctx.textAlign="center",this.ctx.fillText(e,this.canvas.width/2,a),i&&(this.ctx.fillStyle="#ffaa00",this.ctx.font="bold 24px Arial",this.ctx.fillText("▶",this.canvas.width/2-180,a),this.ctx.fillText("◀",this.canvas.width/2+180,a))}),this.ctx.restore()}drawInstructions(){this.ctx.save(),this.ctx.fillStyle="#888888",this.ctx.font="16px Arial",this.ctx.textAlign="center";const e=this.canvas.height-50;this.ctx.fillText("Usa ↑/↓ o W/S para navegar, Enter/Espacio para seleccionar",this.canvas.width/2,e),this.ctx.restore()}cleanup(){console.log("🧹 Limpiando VictoryScene..."),this.initialized=!1,this.winnerData=null,this.canvas=null,this.ctx=null,this.renderer=null}}class ie{constructor(e,t,a){this.battleResult=e,this.onPlayAgain=t,this.onMainMenu=a,this.vfx=new x,this.animationPhase=0,this.animationId=null,this.isInitialized=!1,this.confettiInterval=null}init(){this.isInitialized||(this.vfx.init(),this.isInitialized=!0)}render(){this.isInitialized||this.init();const e=document.createElement("div");e.id="gameover-scene-container",e.className="responsive-container",e.style.cssText=`
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: var(--dark-bg);
            background-image: 
                radial-gradient(circle at 30% 70%, rgba(239, 68, 68, 0.2) 0%, transparent 50%),
                radial-gradient(circle at 70% 30%, rgba(34, 197, 94, 0.2) 0%, transparent 50%);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            color: white;
            font-family: 'Orbitron', monospace;
            overflow: hidden;
            z-index: 1000;
            padding: var(--spacing-lg);
        `;const t=document.createElement("canvas");t.id="gameover-effects-canvas",t.width=window.innerWidth,t.height=window.innerHeight,t.style.cssText=`
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
        `;const a=document.createElement("div");a.id="gameover-shockwave",a.style.cssText=`
            position: absolute;
            top: 50%;
            left: 50%;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            border: 3px solid var(--warning-glow);
            transform: translate(-50%, -50%);
            opacity: 0;
            z-index: 1;
        `;const i=document.createElement("div");i.className="results-container",i.style.cssText=`
            z-index: 10;
            text-align: center;
            transform: scale(0);
            opacity: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 2rem;
        `;const n=document.createElement("div");n.className="result-text",this.battleResult.winner==="PLAYER"?(n.innerHTML="<span>V</span><span>I</span><span>C</span><span>T</span><span>O</span><span>R</span><span>Y</span>",n.style.color="var(--success-glow)",e.style.backgroundImage+=", radial-gradient(circle at 50% 50%, rgba(34, 197, 94, 0.3) 0%, transparent 70%)"):this.battleResult.winner==="AI"?(n.innerHTML="<span>D</span><span>E</span><span>F</span><span>E</span><span>A</span><span>T</span>",n.style.color="var(--danger-glow)",e.style.backgroundImage+=", radial-gradient(circle at 50% 50%, rgba(239, 68, 68, 0.3) 0%, transparent 70%)"):(n.innerHTML="<span>D</span><span>R</span><span>A</span><span>W</span>",n.style.color="var(--warning-glow)"),n.style.cssText+=`
            font-size: 4rem;
            font-weight: 900;
            text-shadow: 0 0 20px currentColor, 0 0 40px currentColor;
            margin-bottom: 1rem;
            position: relative;
        `,n.querySelectorAll("span").forEach(f=>{f.style.cssText=`
                display: inline-block;
                opacity: 0;
                transform: scale(0) rotateY(180deg);
                margin: 0 0.1em;
            `});const r=document.createElement("div");r.className="battle-details",r.style.cssText=`
            background: rgba(0, 0, 0, 0.6);
            padding: 2rem;
            border-radius: 15px;
            border: 2px solid var(--border-color);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(10px);
            opacity: 0;
            transform: translateY(30px);
        `;const o=document.createElement("div");o.textContent=this.battleResult.winnerName||this.battleResult.winner,o.style.cssText=`
            font-size: 2rem;
            font-weight: 700;
            color: var(--primary-glow);
            margin-bottom: 1rem;
            text-shadow: 0 0 10px var(--primary-glow);
        `;const l=document.createElement("div");l.style.cssText=`
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
            margin-bottom: 2rem;
        `,[{label:"Duración",value:this.formatTime(this.battleResult.duration||90)},{label:"Golpes Dados",value:this.battleResult.hitsLanded||"0"},{label:"Combos",value:this.battleResult.combosPerformed||"0"},{label:"Daño Total",value:`${this.battleResult.totalDamage||0}%`}].forEach(f=>{const v=document.createElement("div");v.style.cssText=`
                text-align: center;
                padding: 1rem;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 8px;
                border: 1px solid var(--border-color);
                opacity: 0;
                transform: scale(0.8);
            `;const M=document.createElement("div");M.textContent=f.value,M.style.cssText=`
                font-size: 1.5rem;
                font-weight: 700;
                color: var(--primary-glow);
                margin-bottom: 0.5rem;
            `;const k=document.createElement("div");k.textContent=f.label,k.style.cssText=`
                font-size: 0.9rem;
                color: var(--text-color);
                opacity: 0.8;
            `,v.appendChild(M),v.appendChild(k),l.appendChild(v)});const d=document.createElement("div");d.className="buttons-container",d.style.cssText=`
            display: flex;
            gap: 2rem;
            margin-top: 2rem;
            opacity: 0;
            transform: translateY(20px);
        `;const u=this.createActionButton("REVANCHA",()=>{this.cleanup(),this.onPlayAgain()},"var(--success-glow)"),m=this.createActionButton("MENÚ PRINCIPAL",()=>{this.cleanup(),this.onMainMenu()},"var(--primary-glow)");return d.appendChild(u),d.appendChild(m),r.appendChild(o),r.appendChild(l),r.appendChild(d),i.appendChild(n),i.appendChild(r),e.appendChild(t),e.appendChild(a),e.appendChild(i),document.body.appendChild(e),this.startGameOverAnimation(),this.startContinuousEffects(t),e}createActionButton(e,t,a){const i=document.createElement("button");return i.textContent=e,i.style.cssText=`
            background: transparent;
            border: 2px solid ${a};
            color: ${a};
            padding: 1rem 2rem;
            border-radius: 10px;
            font-size: 1.1rem;
            font-weight: 600;
            font-family: 'Orbitron', monospace;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 0 10px ${a}40;
            text-transform: uppercase;
            letter-spacing: 1px;
            position: relative;
            overflow: hidden;
        `,i.addEventListener("mouseenter",()=>{anime({targets:i,scale:1.05,boxShadow:`0 0 20px ${a}80`,duration:200,easing:"easeOutQuad"});const n=i.getBoundingClientRect();this.vfx.createParticleBurst(n.left+n.width/2,n.top+n.height/2,10,[a,"#ffffff"])}),i.addEventListener("mouseleave",()=>{anime({targets:i,scale:1,boxShadow:`0 0 10px ${a}40`,duration:200,easing:"easeOutQuad"})}),i.addEventListener("click",n=>{n.preventDefault(),anime({targets:i,scale:[1,.95,1],duration:150,easing:"easeInOutSine"}),this.vfx.flashEffect(.3,150),setTimeout(t,200)}),i}startGameOverAnimation(){const e=document.querySelectorAll(".result-text span"),t=document.querySelector(".results-container"),a=document.querySelector(".battle-details"),i=document.querySelector(".buttons-container"),n=document.getElementById("gameover-shockwave"),s=document.querySelectorAll(".battle-details > div:nth-child(2) > div"),r=anime.timeline({easing:"easeOutExpo"});r.add({targets:n,scale:[0,60],opacity:[1,0],duration:1e3,begin:()=>{this.vfx.screenShake(15)}}),r.add({targets:t,scale:[0,1],opacity:[0,1],duration:600},"-=800"),r.add({targets:e,opacity:[0,1],scale:[0,1.2,1],rotateY:[180,0],delay:anime.stagger(100),duration:800},"-=400"),r.add({targets:a,opacity:[0,1],translateY:[30,0],duration:600},"-=200"),r.add({targets:s,opacity:[0,1],scale:[.8,1],delay:anime.stagger(150),duration:500},"-=300"),r.add({targets:i,opacity:[0,1],translateY:[20,0],duration:500},"-=200"),setTimeout(()=>{anime({targets:e,scale:[1,1.05,1],textShadow:["0 0 20px currentColor, 0 0 40px currentColor","0 0 30px currentColor, 0 0 60px currentColor","0 0 20px currentColor, 0 0 40px currentColor"],duration:2e3,loop:!0,direction:"alternate",easing:"easeInOutSine"})},2e3)}startContinuousEffects(e){const t=e.getContext("2d");this.battleResult.winner==="PLAYER"&&(this.confettiInterval=setInterval(()=>{this.createConfetti(t)},2e3)),this.createBackgroundParticles(t)}createConfetti(e){const t=["#FFD700","#FF6B6B","#4ECDC4","#45B7D1","#96CEB4"];for(let a=0;a<50;a++){const i={x:Math.random()*e.canvas.width,y:-10,width:Math.random()*10+5,height:Math.random()*10+5,color:t[Math.floor(Math.random()*t.length)],rotation:Math.random()*360,rotationSpeed:(Math.random()-.5)*10,velocityY:Math.random()*3+2,velocityX:(Math.random()-.5)*2};anime({targets:i,y:e.canvas.height+20,rotation:i.rotation+i.rotationSpeed*100,duration:Math.random()*2e3+2e3,easing:"linear",update:()=>{e.save(),e.translate(i.x,i.y),e.rotate(i.rotation*Math.PI/180),e.fillStyle=i.color,e.fillRect(-i.width/2,-i.height/2,i.width,i.height),e.restore(),i.x+=i.velocityX},complete:()=>{e.clearRect(0,0,e.canvas.width,e.canvas.height)}})}}createBackgroundParticles(e){const t=[];for(let i=0;i<30;i++)t.push({x:Math.random()*e.canvas.width,y:Math.random()*e.canvas.height,size:Math.random()*3+1,alpha:Math.random()*.5+.2,speed:Math.random()*2+.5,color:this.battleResult.winner==="PLAYER"?"rgba(34, 197, 94, ":"rgba(239, 68, 68, "});const a=()=>{e.clearRect(0,0,e.canvas.width,e.canvas.height),t.forEach(i=>{i.y-=i.speed,i.alpha*=.999,i.y<0&&(i.y=e.canvas.height,i.alpha=Math.random()*.5+.2),e.globalAlpha=i.alpha,e.fillStyle=i.color+i.alpha+")",e.beginPath(),e.arc(i.x,i.y,i.size,0,Math.PI*2),e.fill()}),document.getElementById("gameover-scene-container")&&requestAnimationFrame(a)};a()}formatTime(e){const t=Math.floor(e/60),a=Math.floor(e%60);return`${t}:${a.toString().padStart(2,"0")}`}cleanup(){const e=document.getElementById("gameover-scene-container");e&&anime({targets:e,opacity:[1,0],scale:[1,.9],duration:500,easing:"easeInExpo",complete:()=>{e.remove()}}),this.confettiInterval&&clearInterval(this.confettiInterval),this.vfx&&this.vfx.cleanup(),this.animationId&&cancelAnimationFrame(this.animationId)}}class L{constructor(e){this.onLogout=e,this.apiClient=null,this.currentTab="characters",this.data={characters:[],stages:[],music:[]},this.container=null,this.particleCanvas=null,this.animationId=null,this.statsAnimation=null}async init(){p.init(),this.apiClient=window.gameManager?.apiClient,this.apiClient&&await this.loadAllData()}async loadAllData(){try{this.data.characters=await this.apiClient.getAllCharacters(),this.data.stages=await this.apiClient.getStages(),this.data.music=await this.apiClient.getMusic()}catch(e){console.error("Error cargando datos del admin:",e)}}render(){const e=document.getElementById("gameCanvas");e&&(e.style.display="none"),this.container=document.createElement("div"),this.container.id="admin-dashboard-container",this.container.className="responsive-admin-dashboard";const t=p.getDeviceType(),a=p.getResponsiveContainerStyles(t);this.container.style.cssText=`
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: var(--dark-bg);
            background-image: 
                radial-gradient(circle at 10% 20%, rgba(0, 242, 255, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 90% 80%, rgba(255, 215, 0, 0.1) 0%, transparent 50%),
                linear-gradient(45deg, rgba(0, 242, 255, 0.03) 0%, rgba(255, 0, 193, 0.03) 100%);
            color: var(--text-color);
            font-family: 'Inter', sans-serif;
            overflow-x: hidden;
            overflow-y: auto;
            z-index: 1000;
            display: flex;
            flex-direction: column;
            ${a}
        `,this.particleCanvas=document.createElement("canvas"),this.particleCanvas.id="admin-particles-canvas",this.particleCanvas.style.cssText=`
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
            pointer-events: none;
        `,p.setupResponsiveCanvas(this.particleCanvas);const i=this.createEpicHeader(),n=this.createStatsContainer(),s=this.createMainPanel();this.container.appendChild(this.particleCanvas),this.container.appendChild(i),this.container.appendChild(n),this.container.appendChild(s),document.body.appendChild(this.container),this.startAdminAnimation(),this.startParticleBackground(),this.animateStats()}createEpicHeader(){const e=document.createElement("div");e.className="responsive-admin-header";const a=p.getDeviceType()==="mobile";e.style.cssText=`
            display: flex;
            ${a?"flex-direction: column":"justify-content: space-between"};
            ${a?"gap: 1rem":"align-items: center"};
            padding: ${a?"clamp(1rem, 4vw, 2rem)":"clamp(1.5rem, 3vw, 3rem)"};
            background: rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(10px);
            border-bottom: 2px solid var(--primary-glow);
            box-shadow: 0 4px 20px rgba(0, 242, 255, 0.3);
            z-index: 3;
            position: relative;
            opacity: 0;
            transform: translateY(-20px);
            flex-shrink: 0;
        `;const i=document.createElement("h1");i.textContent=a?"ADMIN CENTRAL":"CENTRO DE COMANDO ADMINISTRATIVO",i.className="responsive-admin-title",i.style.cssText=`
            font-family: 'Orbitron', monospace;
            font-size: clamp(1.2rem, 4vw, 2rem);
            font-weight: 900;
            color: #fff;
            text-shadow: 
                0 0 10px var(--primary-glow),
                0 0 20px var(--primary-glow),
                0 0 30px rgba(0, 242, 255, 0.5);
            margin: 0;
            letter-spacing: clamp(1px, 0.2vw, 2px);
            text-transform: uppercase;
            text-align: ${a?"center":"left"};
            ${a?"order: 1;":""}
        `;const n=document.createElement("div");n.className="responsive-user-info",n.style.cssText=`
            display: flex;
            align-items: center;
            gap: clamp(0.5rem, 2vw, 1rem);
            ${a?"justify-content: center; order: 2;":""}
            flex-wrap: wrap;
        `;const s=document.createElement("div");s.className="responsive-user-avatar",s.style.cssText=`
            width: clamp(40px, 8vw, 50px);
            height: clamp(40px, 8vw, 50px);
            border-radius: 50%;
            background: linear-gradient(45deg, var(--primary-glow), var(--secondary-glow));
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Orbitron', monospace;
            font-weight: bold;
            font-size: clamp(1rem, 2vw, 1.2rem);
            color: #000;
            box-shadow: 0 0 20px rgba(0, 242, 255, 0.5);
            flex-shrink: 0;
        `,s.textContent="A";const r=document.createElement("div");r.className="responsive-user-details";const o=document.createElement("div");o.textContent="Administrador",o.style.cssText=`
            font-family: 'Orbitron', monospace;
            font-weight: 600;
            color: var(--primary-glow);
            font-size: clamp(0.9rem, 2vw, 1rem);
            ${a?"text-align: center;":""}
        `;const l=document.createElement("div");l.textContent="CONTROL TOTAL",l.style.cssText=`
            font-size: clamp(0.7rem, 1.8vw, 0.8rem);
            color: var(--warning-glow);
            font-family: 'Orbitron', monospace;
            font-weight: 400;
            ${a?"text-align: center;":""}
        `,r.appendChild(o),r.appendChild(l);const c=document.createElement("button");return c.textContent=a?"← SALIR":"← DESCONECTAR",c.className="responsive-logout-btn",c.style.cssText=`
            background: transparent;
            border: 2px solid var(--danger-glow);
            color: var(--danger-glow);
            padding: clamp(8px, 2vw, 12px) clamp(12px, 3vw, 20px);
            border-radius: 8px;
            font-family: 'Orbitron', monospace;
            font-size: clamp(0.8rem, 1.8vw, 0.9rem);
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: clamp(0.5px, 0.2vw, 1px);
            white-space: nowrap;
        `,c.addEventListener("mouseenter",()=>{typeof anime<"u"&&anime({targets:c,scale:1.05,boxShadow:"0 0 20px rgba(255, 77, 77, 0.6)",duration:200,easing:"easeOutQuad"})}),c.addEventListener("mouseleave",()=>{typeof anime<"u"&&anime({targets:c,scale:1,boxShadow:"0 0 0px rgba(255, 77, 77, 0)",duration:200,easing:"easeOutQuad"})}),c.addEventListener("click",()=>{this.handleLogout()}),n.appendChild(s),n.appendChild(r),n.appendChild(c),e.appendChild(i),e.appendChild(n),e}createStatsContainer(){const e=document.createElement("div");e.className="responsive-stats-section";const a=p.getDeviceType()==="mobile";e.style.cssText=`
            padding: clamp(1rem, 4vw, 2rem) clamp(1rem, 4vw, 3rem);
            z-index: 3;
            position: relative;
            opacity: 0;
            transform: translateY(20px);
            flex-shrink: 0;
        `;const i=document.createElement("h2");i.textContent=a?"ESTADÍSTICAS":"ESTADÍSTICAS DEL SISTEMA",i.className="responsive-stats-title",i.style.cssText=`
            font-family: 'Orbitron', monospace;
            font-size: clamp(1.1rem, 3vw, 1.5rem);
            font-weight: 700;
            color: var(--warning-glow);
            margin-bottom: clamp(1rem, 3vw, 1.5rem);
            text-shadow: 0 0 10px var(--warning-glow);
            text-transform: uppercase;
            letter-spacing: clamp(0.5px, 0.2vw, 1px);
            text-align: ${a?"center":"left"};
        `;const n=document.createElement("div");return n.className="stats-container responsive-stats-grid",n.style.cssText=`
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(clamp(180px, 40vw, 220px), 1fr));
            gap: clamp(1rem, 3vw, 1.5rem);
            width: 100%;
        `,[{label:"Usuarios Hoy",value:1428,color:"var(--success-glow)"},{label:"Partidas Activas",value:87,color:"var(--primary-glow)"},{label:"Win Rate (%)",value:92.5,color:"var(--warning-glow)"},{label:"Ping (ms)",value:215,color:"var(--secondary-glow)"}].forEach(r=>{const o=document.createElement("div");o.className="stat-card responsive-stat-card",o.style.cssText=`
                background: rgba(0, 0, 0, 0.3);
                border: 1px solid ${r.color};
                border-radius: clamp(8px, 2vw, 12px);
                padding: clamp(1rem, 3vw, 1.5rem);
                text-align: center;
                transition: all 0.3s ease;
                backdrop-filter: blur(5px);
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                cursor: pointer;
                min-height: clamp(100px, 20vw, 120px);
                display: flex;
                flex-direction: column;
                justify-content: center;
                gap: clamp(0.3rem, 1vw, 0.5rem);
            `;const l=document.createElement("div");l.className="value responsive-stat-value",l.dataset.value=r.value,l.textContent="0",l.style.cssText=`
                font-size: clamp(1.5rem, 5vw, 2.5rem);
                font-family: 'Orbitron', monospace;
                font-weight: 900;
                color: ${r.color};
                margin-bottom: clamp(0.2rem, 1vw, 0.5rem);
                text-shadow: 0 0 10px ${r.color};
                line-height: 1;
            `;const c=document.createElement("div");c.className="label responsive-stat-label",c.textContent=r.label,c.style.cssText=`
                font-size: clamp(0.7rem, 2vw, 0.9rem);
                color: var(--text-color);
                font-family: 'Orbitron', monospace;
                font-weight: 400;
                text-transform: uppercase;
                letter-spacing: clamp(0.3px, 0.1vw, 1px);
                line-height: 1.2;
            `,o.appendChild(l),o.appendChild(c),n.appendChild(o),o.addEventListener("mouseenter",()=>{typeof anime<"u"&&anime({targets:o,translateY:-5,boxShadow:`0 10px 25px ${r.color}40`,duration:200,easing:"easeOutQuad"})}),o.addEventListener("mouseleave",()=>{typeof anime<"u"&&anime({targets:o,translateY:0,boxShadow:"0 4px 15px rgba(0, 0, 0, 0.2)",duration:200,easing:"easeOutQuad"})})}),e.appendChild(i),e.appendChild(n),e}createMainPanel(){const e=document.createElement("div");e.className="responsive-main-panel";const a=p.getDeviceType()==="mobile";e.style.cssText=`
            flex: 1;
            padding: 0 clamp(1rem, 4vw, 3rem) clamp(1rem, 4vw, 2rem) clamp(1rem, 4vw, 3rem);
            z-index: 3;
            position: relative;
            overflow-y: auto;
            opacity: 0;
            transform: translateY(30px);
            min-height: 0; /* Para permitir que el flex funcione correctamente */
        `;const i=document.createElement("div");i.className="responsive-tabs-container",i.style.cssText=`
            background: rgba(0, 0, 0, 0.3);
            border-radius: clamp(10px, 2vw, 15px);
            padding: clamp(1rem, 4vw, 2rem);
            border: 1px solid var(--primary-glow);
            box-shadow: 
                0 0 30px rgba(0, 242, 255, 0.2),
                inset 0 0 30px rgba(0, 242, 255, 0.05);
            backdrop-filter: blur(10px);
        `;const n=document.createElement("div");n.className="responsive-tabs-nav",n.style.cssText=`
            display: flex;
            ${a?"flex-direction: column":"flex-direction: row"};
            gap: clamp(0.5rem, 2vw, 1rem);
            margin-bottom: clamp(1rem, 3vw, 2rem);
            border-bottom: 1px solid var(--border-color);
            padding-bottom: clamp(0.5rem, 2vw, 1rem);
            ${a?"align-items: stretch;":""}
        `;const s=["characters","stages","music"],r=["Personajes","Escenarios","Música"];s.forEach((c,d)=>{const u=document.createElement("button");u.textContent=r[d],u.dataset.tab=c,u.className=`admin-tab responsive-tab-btn ${c===this.currentTab?"active":""}`,u.style.cssText=`
                background: ${c===this.currentTab?"var(--primary-glow)":"transparent"};
                color: ${c===this.currentTab?"#000":"var(--text-color)"};
                border: 2px solid var(--primary-glow);
                padding: clamp(8px, 2vw, 12px) clamp(12px, 3vw, 20px);
                border-radius: clamp(4px, 1vw, 8px);
                font-family: 'Orbitron', monospace;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                text-transform: uppercase;
                letter-spacing: clamp(0.3px, 0.1vw, 1px);
                font-size: clamp(0.8rem, 2vw, 0.9rem);
                ${a?"flex: 1; text-align: center;":""}
                white-space: nowrap;
            `,u.addEventListener("click",()=>{this.switchTab(c,n)}),n.appendChild(u)});const o=document.createElement("div");o.id="management-content",o.className="responsive-management-content",o.style.cssText=`
            min-height: clamp(200px, 30vh, 300px);
        `;const l=document.createElement("div");return l.className="responsive-content-text",l.style.cssText=`
            text-align: center;
            color: var(--text-color);
            font-family: 'Orbitron', monospace;
            font-size: clamp(1rem, 2.5vw, 1.2rem);
            padding: clamp(1rem, 4vw, 2rem);
            line-height: 1.4;
        `,l.textContent=`Panel de gestión de ${r[s.indexOf(this.currentTab)]} - En desarrollo`,o.appendChild(l),i.appendChild(n),i.appendChild(o),e.appendChild(i),e}switchTab(e,t){this.currentTab=e,t.querySelectorAll(".admin-tab").forEach(i=>{i.dataset.tab===e?(i.style.background="var(--primary-glow)",i.style.color="#000",i.classList.add("active")):(i.style.background="transparent",i.style.color="var(--text-color)",i.classList.remove("active"))});const a=document.getElementById("management-content");typeof anime<"u"&&anime({targets:a,opacity:[1,0],translateY:[0,-10],duration:200,easing:"easeInQuad",complete:()=>{const i={characters:"Personajes",stages:"Escenarios",music:"Música"};a.querySelector("div").textContent=`Panel de gestión de ${i[e]} - En desarrollo`,anime({targets:a,opacity:[0,1],translateY:[-10,0],duration:300,easing:"easeOutQuad"})}})}startAdminAnimation(){if(typeof anime>"u"){console.warn("⚠️ anime.js no disponible en AdminDashboardScene");return}const e=this.container.querySelector("div:nth-child(2)"),t=this.container.querySelector("div:nth-child(3)"),a=this.container.querySelector("div:nth-child(4)");anime.timeline({easing:"easeOutExpo"}).add({targets:e,opacity:[0,1],translateY:[-20,0],duration:800}).add({targets:t,opacity:[0,1],translateY:[20,0],duration:600},"-=400").add({targets:a,opacity:[0,1],translateY:[30,0],duration:600},"-=300")}animateStats(){if(typeof anime>"u")return;this.container.querySelectorAll(".stat-card .value").forEach(t=>{const a={val:0};anime({targets:a,val:parseFloat(t.dataset.value),round:t.dataset.value.includes(".")?10:1,duration:2e3,easing:"easeOutCubic",delay:800,update:()=>{t.textContent=t.dataset.value.includes(".")?a.val.toFixed(1):a.val}})})}startParticleBackground(){if(!this.particleCanvas)return;const e=this.particleCanvas.getContext("2d"),t=[];for(let i=0;i<50;i++)t.push({x:Math.random()*this.particleCanvas.width,y:Math.random()*this.particleCanvas.height,size:Math.random()*1.5+.5,speedX:(Math.random()-.5)*.3,speedY:(Math.random()-.5)*.3,opacity:Math.random()*.4+.1,color:["rgba(0, 242, 255, ","rgba(255, 215, 0, ","rgba(0, 255, 140, "][Math.floor(Math.random()*3)]});const a=()=>{e.clearRect(0,0,this.particleCanvas.width,this.particleCanvas.height),t.forEach(i=>{i.x+=i.speedX,i.y+=i.speedY,(i.x<0||i.x>this.particleCanvas.width)&&(i.speedX*=-1),(i.y<0||i.y>this.particleCanvas.height)&&(i.speedY*=-1),e.globalAlpha=i.opacity,e.fillStyle=i.color+i.opacity+")",e.beginPath(),e.arc(i.x,i.y,i.size,0,Math.PI*2),e.fill()}),document.getElementById("admin-dashboard-container")&&(this.animationId=requestAnimationFrame(a))};a()}handleLogout(){console.log("🚪 Cerrando sesión de administrador..."),typeof anime<"u"?anime({targets:this.container,opacity:[1,0],scale:[1,.95],duration:600,easing:"easeInExpo",complete:()=>{this.onLogout&&this.onLogout()}}):this.onLogout&&this.onLogout()}cleanup(){this.animationId&&cancelAnimationFrame(this.animationId),this.statsAnimation&&anime.remove(this.statsAnimation),this.particleCanvas&&p.cleanup(this.particleCanvas),this.container&&this.container.remove()}}class N{constructor(e){this.onBack=e,this.currentTab="video",this.preferences=null,this.pendingChanges={},this.container=null,this.particleCanvas=null,this.animationId=null,this.saveTimeout=null}async init(){p.init(),this.preferences=C.getPreferences()}render(){this.preferences||this.init();const e=document.getElementById("gameCanvas");e&&(e.style.display="none"),this.container=document.createElement("div"),this.container.id="options-scene-container",this.container.className="responsive-options-container";const t=p.getDeviceType(),a=p.getResponsiveContainerStyles(t);this.container.style.cssText=`
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: var(--dark-bg);
            background-image: 
                radial-gradient(circle at 20% 80%, rgba(0, 242, 255, 0.15) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(255, 0, 193, 0.15) 0%, transparent 50%);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            font-family: 'Inter', sans-serif;
            overflow-x: hidden;
            overflow-y: auto;
            padding: clamp(1rem, 4vw, 2rem);
            ${a}
        `,this.particleCanvas=document.createElement("canvas"),this.particleCanvas.id="options-particles-canvas",this.particleCanvas.style.cssText=`
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
            pointer-events: none;
        `,p.setupResponsiveCanvas(this.particleCanvas);const i=document.createElement("h1");i.textContent=t==="mobile"?"OPCIONES":"CONFIGURACIÓN",i.className="responsive-options-title",i.style.cssText=`
            font-family: 'Orbitron', monospace;
            font-size: clamp(1.5rem, 6vw, 3rem);
            font-weight: 900;
            color: #fff;
            margin-bottom: clamp(1rem, 3vw, 2rem);
            text-shadow: 0 0 10px var(--primary-glow), 0 0 20px var(--primary-glow);
            opacity: 0;
            transform: translateY(-30px);
            z-index: 3;
            text-align: center;
            word-break: break-word;
        `;const n=document.createElement("div");n.className="options-container responsive-options-content",n.style.cssText=`
            width: 100%;
            max-width: ${t==="mobile"?"95vw":"min(90vw, 800px)"};
            min-height: ${t==="mobile"?"60vh":"50vh"};
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid var(--primary-glow);
            border-radius: clamp(10px, 2vw, 15px);
            padding: clamp(1rem, 3vw, 2rem);
            box-shadow: 
                0 0 30px rgba(0, 242, 255, 0.3),
                inset 0 0 30px rgba(0, 242, 255, 0.1);
            backdrop-filter: blur(10px);
            z-index: 3;
            position: relative;
            opacity: 0;
            transform: scale(0.9) translateY(20px);
            overflow: hidden;
        `;const s=this.createTabs(),r=this.createTabContent(),o=document.createElement("button");return o.textContent="← VOLVER",o.className="responsive-back-btn",o.style.cssText=`
            position: absolute;
            top: clamp(1rem, 3vw, 2rem);
            left: clamp(1rem, 3vw, 2rem);
            background: transparent;
            border: 2px solid var(--secondary-glow);
            color: var(--secondary-glow);
            padding: clamp(8px, 2vw, 12px) clamp(12px, 3vw, 20px);
            border-radius: clamp(6px, 1vw, 8px);
            font-family: 'Orbitron', monospace;
            font-size: clamp(0.8rem, 2vw, 1rem);
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: clamp(0.5px, 0.2vw, 1px);
            z-index: 4;
            opacity: 0;
            transform: translateX(-20px);
            min-height: 44px; /* Touch-friendly */
            white-space: nowrap;
        `,this.setupBackButton(o),n.appendChild(s),n.appendChild(r),this.container.appendChild(this.particleCanvas),this.container.appendChild(o),this.container.appendChild(i),this.container.appendChild(n),document.body.appendChild(this.container),this.startOptionsAnimation(),this.startParticleBackground(),this.container}createTabs(){const t=p.getDeviceType()==="mobile",a=document.createElement("div");a.className="tabs responsive-options-tabs",a.style.cssText=`
            display: flex;
            border-bottom: 1px solid var(--border-color);
            position: relative;
            margin-bottom: clamp(1rem, 3vw, 2rem);
            overflow-x: auto;
            scroll-behavior: smooth;
            ${t?"justify-content: center;":""}
        `;const i=document.createElement("div");return i.className="tab-underline",i.style.cssText=`
            position: absolute;
            bottom: 0;
            height: 2px;
            background-color: var(--primary-glow);
            transition: all 0.3s ease;
            width: 0;
            left: 0;
        `,[{id:"video",text:"Video"},{id:"audio",text:"Audio"},{id:"game",text:"Juego"}].forEach((s,r)=>{const o=document.createElement("div");o.className=`tab responsive-tab ${s.id===this.currentTab?"active":""}`,o.dataset.tab=s.id,o.textContent=s.text,o.style.cssText=`
                padding: clamp(10px, 2vw, 15px) clamp(15px, 3vw, 20px);
                cursor: pointer;
                color: ${s.id===this.currentTab?"var(--primary-glow)":"var(--text-color)"};
                transition: all 0.3s ease;
                z-index: 1;
                position: relative;
                font-family: 'Orbitron', monospace;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: clamp(0.5px, 0.2vw, 1px);
                font-size: clamp(0.8rem, 2vw, 1rem);
                white-space: nowrap;
                flex-shrink: 0;
                ${t?"flex: 1; text-align: center; min-width: fit-content;":""}
            `,o.addEventListener("click",()=>{this.switchTab(s.id,a,i)}),a.appendChild(o)}),a.appendChild(i),this.moveUnderline(a.querySelector(".tab.active"),i),a}createTabContent(){const e=document.createElement("div");e.className="tab-content-container",e.style.cssText=`
            min-height: clamp(250px, 40vh, 300px);
            position: relative;
            width: 100%;
            overflow-y: auto;
            max-height: 60vh;
        `;const t=this.createVideoTabContent();t.id="video-content",t.className="tab-content active",t.style.display=this.currentTab==="video"?"block":"none";const a=this.createAudioTabContent();a.id="audio-content",a.className="tab-content",a.style.display=this.currentTab==="audio"?"block":"none";const i=this.createGameTabContent();return i.id="game-content",i.className="tab-content",i.style.display=this.currentTab==="game"?"block":"none",e.appendChild(t),e.appendChild(a),e.appendChild(i),e}createVideoTabContent(){const e=document.createElement("div");e.style.cssText=`
            padding: clamp(0.5rem, 2vw, 1rem);
        `;const t=this.createControlGroup("Modo Debug","checkbox"),a=t.querySelector("input");a.checked=this.preferences?.graphics?.debugMode||!1,a.addEventListener("change",o=>{this.updatePreference("graphics.debugMode",o.target.checked)});const i=this.createControlGroup("Mostrar Hitboxes","checkbox"),n=i.querySelector("input");n.checked=this.preferences?.graphics?.showHitboxes||!1,n.addEventListener("change",o=>{this.updatePreference("graphics.showHitboxes",o.target.checked)});const s=this.createControlGroup("Mostrar Frame Data","checkbox"),r=s.querySelector("input");return r.checked=this.preferences?.graphics?.showFrameData||!1,r.addEventListener("change",o=>{this.updatePreference("graphics.showFrameData",o.target.checked)}),e.appendChild(t),e.appendChild(i),e.appendChild(s),e}createAudioTabContent(){const e=document.createElement("div");e.style.cssText=`
            padding: clamp(0.5rem, 2vw, 1rem);
        `;const t=this.createControlGroup("Volumen General","slider"),a=t.querySelector("input");a.min="0",a.max="100",a.value=Math.round((this.preferences?.audio?.masterVolume||.7)*100),a.addEventListener("input",o=>{this.updatePreference("audio.masterVolume",o.target.value/100)});const i=this.createControlGroup("Volumen Música","slider"),n=i.querySelector("input");n.min="0",n.max="100",n.value=Math.round((this.preferences?.audio?.musicVolume||.6)*100),n.addEventListener("input",o=>{this.updatePreference("audio.musicVolume",o.target.value/100)});const s=this.createControlGroup("Volumen Efectos","slider"),r=s.querySelector("input");return r.min="0",r.max="100",r.value=Math.round((this.preferences?.audio?.sfxVolume||.8)*100),r.addEventListener("input",o=>{this.updatePreference("audio.sfxVolume",o.target.value/100)}),e.appendChild(t),e.appendChild(i),e.appendChild(s),e}createGameTabContent(){const e=document.createElement("div");e.style.cssText=`
            padding: clamp(0.5rem, 2vw, 1rem);
        `;const t=this.createControlGroup("Dificultad IA","select"),a=t.querySelector("select");["easy","normal","hard"].forEach(c=>{const d=document.createElement("option");d.value=c,d.textContent=c.charAt(0).toUpperCase()+c.slice(1),c===(this.preferences?.gameplay?.difficulty||"normal")&&(d.selected=!0),a.appendChild(d)}),a.addEventListener("change",c=>{this.updatePreference("gameplay.difficulty",c.target.value)});const n=this.createControlGroup("Tiempo Buffer Input (ms)","slider"),s=n.querySelector("input");s.min="50",s.max="300",s.value=this.preferences?.gameplay?.inputBufferTime||150,s.addEventListener("input",c=>{this.updatePreference("gameplay.inputBufferTime",parseInt(c.target.value))});const r=document.createElement("h3");r.textContent="Controles Jugador 1",r.style.cssText=`
            color: var(--primary-glow);
            font-family: 'Orbitron', monospace;
            margin: clamp(1rem, 3vw, 2rem) 0 clamp(0.5rem, 2vw, 1rem) 0;
            text-shadow: 0 0 5px var(--primary-glow);
            font-size: clamp(1rem, 3vw, 1.2rem);
        `,e.appendChild(t),e.appendChild(n),e.appendChild(r);const o=this.preferences?.controls?.p1||{};return Object.entries({up:"Arriba",down:"Abajo",left:"Izquierda",right:"Derecha",punch:"Puño",kick:"Patada",special:"Especial",super:"Súper"}).forEach(([c,d])=>{const u=this.createControlGroup(d,"key"),m=u.querySelector("input");m.value=o[c]||"",m.addEventListener("keydown",f=>{f.preventDefault(),m.value=f.key,this.updatePreference(`controls.p1.${c}`,f.key)}),e.appendChild(u)}),e}createControlGroup(e,t){const a=document.createElement("div");a.className="control-group",a.style.cssText=`
            margin-bottom: clamp(1rem, 3vw, 1.5rem);
            opacity: 0;
            transform: translateY(10px);
            display: flex;
            flex-direction: column;
            gap: clamp(0.3rem, 1vw, 0.5rem);
        `;const i=document.createElement("label");i.textContent=e,i.style.cssText=`
            color: var(--text-color);
            font-family: 'Orbitron', monospace;
            font-weight: 600;
            font-size: clamp(0.8rem, 2vw, 0.9rem);
        `;let n;switch(t){case"checkbox":n=this.createHolographicCheckbox();break;case"slider":n=this.createHolographicSlider();break;case"select":n=this.createHolographicSelect();break;case"key":n=this.createKeyInput();break;default:n=document.createElement("input")}return a.appendChild(i),a.appendChild(n),a}createHolographicCheckbox(){const e=document.createElement("div");e.className="checkbox-container",e.style.cssText=`
            display: flex;
            align-items: center;
            cursor: pointer;
        `;const t=document.createElement("input");t.type="checkbox",t.style.display="none";const a=document.createElement("div");a.className="checkbox-custom",a.style.cssText=`
            width: clamp(16px, 3vw, 20px);
            height: clamp(16px, 3vw, 20px);
            border: 2px solid var(--primary-glow);
            border-radius: 4px;
            position: relative;
            margin-right: clamp(6px, 2vw, 10px);
            background: rgba(0, 242, 255, 0.1);
            transition: all 0.3s ease;
            flex-shrink: 0;
        `;const i=document.createElement("div");i.innerHTML="✓",i.style.cssText=`
            color: var(--primary-glow);
            font-size: clamp(12px, 2.5vw, 14px);
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0);
            transition: transform 0.3s ease;
        `;const n=document.createElement("span");return n.textContent="Activado",n.style.cssText=`
            color: var(--text-color);
            font-family: 'Inter', sans-serif;
            font-size: clamp(0.8rem, 2vw, 1rem);
        `,t.addEventListener("change",()=>{t.checked?(i.style.transform="translate(-50%, -50%) scale(1)",a.style.boxShadow="0 0 10px var(--primary-glow)"):(i.style.transform="translate(-50%, -50%) scale(0)",a.style.boxShadow="none")}),a.appendChild(i),e.appendChild(t),e.appendChild(a),e.appendChild(n),e.addEventListener("click",()=>{t.checked=!t.checked,t.dispatchEvent(new Event("change"))}),e}createHolographicSlider(){const e=document.createElement("input");e.type="range",e.style.cssText=`
            width: 100%;
            -webkit-appearance: none;
            appearance: none;
            background: transparent;
            cursor: pointer;
        `;const t=document.createElement("style");return t.textContent=`
            input[type="range"]::-webkit-slider-runnable-track {
                height: 4px;
                background: linear-gradient(90deg, rgba(0, 242, 255, 0.3), rgba(0, 242, 255, 0.8));
                border-radius: 2px;
                border: 1px solid var(--primary-glow);
            }
            input[type="range"]::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                margin-top: -8px;
                height: 20px;
                width: 20px;
                border-radius: 50%;
                background: var(--primary-glow);
                box-shadow: 0 0 10px var(--primary-glow);
                cursor: pointer;
                transition: box-shadow 0.2s ease;
            }
            input[type="range"]:active::-webkit-slider-thumb {
                box-shadow: 0 0 20px 5px var(--primary-glow);
            }
        `,document.head.appendChild(t),e}createHolographicSelect(){const e=document.createElement("select");return e.style.cssText=`
            width: 100%;
            padding: clamp(8px, 2vw, 10px);
            background: rgba(0, 242, 255, 0.1);
            border: 1px solid var(--primary-glow);
            border-radius: 5px;
            color: var(--text-color);
            font-family: 'Inter', sans-serif;
            font-size: clamp(0.8rem, 2vw, 1rem);
            box-shadow: 0 0 10px rgba(0, 242, 255, 0.3) inset;
            transition: all 0.3s ease;
        `,e.addEventListener("focus",()=>{e.style.boxShadow="0 0 15px rgba(0, 242, 255, 0.6) inset, 0 0 5px var(--primary-glow)"}),e.addEventListener("blur",()=>{e.style.boxShadow="0 0 10px rgba(0, 242, 255, 0.3) inset"}),e}createKeyInput(){const e=document.createElement("input");return e.type="text",e.readOnly=!0,e.placeholder="Presiona una tecla...",e.style.cssText=`
            width: 100%;
            padding: clamp(8px, 2vw, 10px);
            background: rgba(255, 0, 193, 0.1);
            border: 1px solid var(--secondary-glow);
            border-radius: 5px;
            color: var(--text-color);
            font-family: 'Orbitron', monospace;
            text-align: center;
            font-weight: 600;
            font-size: clamp(0.8rem, 2vw, 1rem);
            box-shadow: 0 0 10px rgba(255, 0, 193, 0.3) inset;
            transition: all 0.3s ease;
            cursor: pointer;
        `,e.addEventListener("focus",()=>{e.style.boxShadow="0 0 15px rgba(255, 0, 193, 0.6) inset, 0 0 5px var(--secondary-glow)",e.placeholder="Presionando..."}),e.addEventListener("blur",()=>{e.style.boxShadow="0 0 10px rgba(255, 0, 193, 0.3) inset",e.placeholder="Presiona una tecla..."}),e}updatePreference(e,t){const a=e.split("."),i={};let n=i;for(let s=0;s<a.length-1;s++)n[a[s]]={},n=n[a[s]];n[a[a.length-1]]=t,this.pendingChanges=this.deepMerge(this.pendingChanges,i),this.preferences=this.deepMerge(this.preferences,i),clearTimeout(this.saveTimeout),this.saveTimeout=setTimeout(()=>{this.savePreferences()},500)}async savePreferences(){try{await C.updatePreferences(this.pendingChanges),this.pendingChanges={},console.log("✅ Preferencias guardadas")}catch(e){console.error("❌ Error guardando preferencias:",e)}}deepMerge(e,t){const a={...e};for(const i in t)t[i]&&typeof t[i]=="object"&&!Array.isArray(t[i])?a[i]=this.deepMerge(e[i]||{},t[i]):a[i]=t[i];return a}setupBackButton(e){e.addEventListener("mouseenter",()=>{typeof anime<"u"&&anime({targets:e,scale:1.05,boxShadow:"0 0 20px rgba(255, 0, 193, 0.6)",duration:200,easing:"easeOutQuad"})}),e.addEventListener("mouseleave",()=>{typeof anime<"u"&&anime({targets:e,scale:1,boxShadow:"0 0 0px rgba(255, 0, 193, 0)",duration:200,easing:"easeOutQuad"})}),e.addEventListener("click",()=>{this.handleBack()})}switchTab(e,t,a){if(e===this.currentTab)return;const i=this.container.querySelector(`#${this.currentTab}-content`),n=this.container.querySelector(`#${e}-content`);if(!n){console.warn(`No se encontró contenido para la pestaña: ${e}`);return}const s=t.querySelector(`[data-tab="${e}"]`),r=s.getBoundingClientRect(),o=this.particleCanvas.getBoundingClientRect();this.createTabParticles(r.left-o.left+r.width/2,r.top-o.top+r.height/2),t.querySelectorAll(".tab").forEach(c=>{c.classList.remove("active"),c.style.color="var(--text-color)"}),s.classList.add("active"),s.style.color="var(--primary-glow)",this.moveUnderline(s,a),typeof anime<"u"?anime.timeline().add({targets:i?i.querySelectorAll(".control-group"):[],translateY:[0,-10],opacity:[1,0],delay:anime.stagger(50),easing:"easeInExpo",duration:300,complete:()=>{i&&(i.style.display="none"),n.style.display="block",n.querySelectorAll(".control-group").forEach(c=>{c.style.opacity="0",c.style.transform="translateY(10px)"})}}).add({targets:n.querySelectorAll(".control-group"),translateY:[10,0],opacity:[0,1],delay:anime.stagger(100),easing:"easeOutExpo",duration:500},"+=50"):(i&&(i.style.display="none"),n.style.display="block",n.querySelectorAll(".control-group").forEach(c=>{c.style.opacity="1",c.style.transform="translateY(0)"})),this.currentTab=e}createTabParticles(e,t){if(!this.particleCanvas)return;const a=this.particleCanvas.getContext("2d");for(let i=0;i<20;i++){const n={x:e,y:t,radius:Math.random()*3+1,color:"rgba(0, 242, 255, 1)",alpha:1,vx:(Math.random()-.5)*8,vy:(Math.random()-.5)*8};typeof anime<"u"&&anime({targets:n,x:n.x+n.vx*20,y:n.y+n.vy*20,alpha:0,duration:Math.random()*500+500,easing:"easeOutExpo",update:()=>{a.fillStyle=n.color.replace("1)",n.alpha+")"),a.beginPath(),a.arc(n.x,n.y,n.radius,0,2*Math.PI),a.fill()}})}setTimeout(()=>{this.particleCanvas&&a.clearRect(0,0,this.particleCanvas.width,this.particleCanvas.height)},1e3)}moveUnderline(e,t){typeof anime<"u"?anime({targets:t,left:e.offsetLeft,width:e.offsetWidth,easing:"spring(1, 80, 10, 0)",duration:600}):(t.style.left=e.offsetLeft+"px",t.style.width=e.offsetWidth+"px")}startOptionsAnimation(){if(typeof anime>"u"){console.warn("⚠️ anime.js no disponible en OptionsScene");return}const e=this.container.querySelector("h1"),t=this.container.querySelector(".options-container"),a=this.container.querySelector("button"),i=this.container.querySelectorAll(".control-group");anime.timeline({easing:"easeOutExpo"}).add({targets:a,opacity:[0,1],translateX:[-20,0],duration:600}).add({targets:e,opacity:[0,1],translateY:[-30,0],duration:800},"-=400").add({targets:t,opacity:[0,1],scale:[.9,1],translateY:[20,0],duration:600},"-=400").add({targets:i,opacity:[0,1],translateY:[10,0],delay:anime.stagger(100),duration:500},"-=200")}startParticleBackground(){if(!this.particleCanvas)return;const e=this.particleCanvas.getContext("2d"),t=[];for(let i=0;i<30;i++)t.push({x:Math.random()*this.particleCanvas.width,y:Math.random()*this.particleCanvas.height,size:Math.random()*2+1,speedX:(Math.random()-.5)*.5,speedY:(Math.random()-.5)*.5,opacity:Math.random()*.3+.1,color:Math.random()>.5?"rgba(0, 242, 255, ":"rgba(255, 0, 193, "});const a=()=>{e.clearRect(0,0,this.particleCanvas.width,this.particleCanvas.height),t.forEach(i=>{i.x+=i.speedX,i.y+=i.speedY,(i.x<0||i.x>this.particleCanvas.width)&&(i.speedX*=-1),(i.y<0||i.y>this.particleCanvas.height)&&(i.speedY*=-1),e.globalAlpha=i.opacity,e.fillStyle=i.color+i.opacity+")",e.beginPath(),e.arc(i.x,i.y,i.size,0,Math.PI*2),e.fill()}),document.getElementById("options-scene-container")&&(this.animationId=requestAnimationFrame(a))};a()}handleBack(){console.log("🔙 Volviendo..."),typeof anime<"u"?anime({targets:this.container,opacity:[1,0],scale:[1,.9],duration:500,easing:"easeInExpo",complete:()=>{this.onBack&&this.onBack()}}):this.onBack&&this.onBack()}cleanup(){this.animationId&&(cancelAnimationFrame(this.animationId),this.animationId=null),this.saveTimeout&&(clearTimeout(this.saveTimeout),this.saveTimeout=null),this.particleCanvas&&p.cleanup(this.particleCanvas),this.resizeHandler&&(window.removeEventListener("resize",this.resizeHandler),this.resizeHandler=null),Object.keys(this.pendingChanges).length>0&&this.savePreferences(),this.container&&this.container.remove();const e=document.getElementById("gameCanvas");e&&(e.style.display="block"),this.container=null,this.particleCanvas=null,this.preferences=null,this.pendingChanges={}}}class ne{constructor(e={}){this.config={isDevelopment:e.isDevelopment??!0,enablePerformanceMonitoring:e.enablePerformanceMonitoring??!0,enableGlobalDebug:e.enableGlobalDebug??!0,...e},this.managerFactory=new K(this.config);const t=this.managerFactory.createAllManagers();this.apiClient=t.apiClient,this.authManager=t.authManager,this.sceneManager=t.sceneManager,this.gameManager=t.gameManager,this.performanceMonitor=t.performanceMonitor,this.managerFactory.setupUserPreferencesManager(),this.state={isInitialized:!1,isShuttingDown:!1,currentUser:null,lastError:null},this.config.isDevelopment&&this.config.enableGlobalDebug&&this.setupGlobalDebugAccess(),console.log("🎮 ApplicationController v3.0 inicializado con Factory Pattern")}setupGlobalDebugAccess(){window.appController=this,window.gameManager=this.gameManager,window.sceneManager=this.sceneManager,window.performanceMonitor=this.performanceMonitor,console.log("🐛 Acceso global configurado para debug")}async initialize(){if(this.state.isInitialized){console.warn("⚠️ ApplicationController ya inicializado");return}try{console.log("🚀 Iniciando ApplicationController v2.0..."),await this.validateDependencies(),this.registerScenes(),await this.initializeServices(),await this.initializeAuthenticationFlow(),this.state.isInitialized=!0,console.log("✅ ApplicationController v2.0 inicializado correctamente")}catch(e){throw this.handleInitializationError(e),new Error(`Fallo en inicialización: ${e.message}`)}}handleInitializationError(e){this.state.lastError=e,console.error("❌ Error al inicializar ApplicationController:",e);try{this.performanceMonitor?.stop()}catch(t){console.warn("⚠️ Error en cleanup de emergencia:",t)}}async validateDependencies(){const t=["gameCanvas"].filter(a=>!document.getElementById(a));if(t.length>0)throw new Error(`Elementos DOM requeridos no encontrados: ${t.join(", ")}`);if(!this.apiClient||typeof this.apiClient.login!="function")throw new Error("ApiClient no válido o mal configurado");console.log("✅ Dependencias validadas correctamente")}async initializeServices(){this.authManager.init(),this.IS_DEV_MODE&&(this.performanceMonitor.start(),console.log("📊 PerformanceMonitor activado en modo desarrollo")),console.log("✅ Servicios inicializados correctamente")}registerScenes(){const e=[["login",P],["loading",W],["title",A],["gameMode",I],["characterSelect",$],["battle",D],["victory",ae],["gameOver",ie],["adminDashboard",L],["options",N]];e.forEach(([t,a])=>{this.sceneManager.registerScene(t,a)}),console.log("✅ Escenas registradas:",e.map(([t])=>t))}async initializeAuthenticationFlow(){if(!this.authManager.isAuthenticated())await this.showLoginScene();else{const e=this.authManager.getUser();await this.handleAuthentication(e.role)}}async showLoginScene(){const e=new P(t=>{this.handleAuthentication(t)});await this.renderScene(e)}async handleAuthentication(e){try{const t=this.authManager.getUser();await UserPreferencesManager.loadPreferences(t.id),e==="ADMIN"?await this.transitionToAdminDashboard():await this.transitionToTitle()}catch(t){console.warn("⚠️ Error cargando preferencias:",t),e==="ADMIN"?await this.transitionToAdminDashboard():await this.transitionToTitle()}}async renderScene(e){try{typeof e.init=="function"&&await e.init(),e.render()}catch(t){throw console.error("❌ Error renderizando escena:",t),t}}async transitionToTitle(){const e=new A(()=>this.transitionToGameMode(),()=>this.transitionToOptions(),()=>this.handleLogout());await this.sceneManager.transitionTo("title",{scene:e})}async transitionToOptions(){const e=new N(()=>{this.transitionToTitle()});await this.sceneManager.transitionTo("options",{scene:e})}async transitionToAdminDashboard(){const e=new L(()=>{this.handleLogout()});await this.sceneManager.transitionTo("adminDashboard",{scene:e})}async transitionToGameMode(){const e=new I(t=>{this.transitionToCharacterSelect(t)});await this.sceneManager.transitionTo("gameMode",{scene:e})}async transitionToCharacterSelect(e){const t=new $(a=>{this.transitionToBattle(a)},e);await this.sceneManager.transitionTo("characterSelect",{scene:t})}async transitionToBattle(e){this.gameManager.isRunning||this.gameManager.startGame();const t=new D(e,this.gameManager);await this.sceneManager.transitionTo("battle",{scene:t})}async handleLogout(){try{this.authManager.logout(),this.gameManager.isRunning&&this.gameManager.stopGame(),await this.initializeAuthenticationFlow()}catch(e){console.error("❌ Error durante logout:",e),window.location.reload()}}async shutdown(){if(!this.isShuttingDown){this.isShuttingDown=!0;try{this.performanceMonitor&&this.performanceMonitor.stop(),this.gameManager?.isRunning&&this.gameManager.stopGame(),this.sceneManager?.currentScene&&await this.sceneManager.cleanupCurrentScene(),this.IS_DEV_MODE&&window.gameManager&&delete window.gameManager,this.IS_DEV_MODE&&window.debugController&&delete window.debugController,this.isInitialized=!1,console.log("✅ ApplicationController shutdown completo")}catch(e){console.error("❌ Error durante shutdown:",e)}}}getServices(){return{authManager:this.authManager,sceneManager:this.sceneManager,gameManager:this.gameManager,performanceMonitor:this.performanceMonitor,apiClient:this.apiClient}}getApplicationState(){const e=this.performanceMonitor?.generateReport();return{isInitialized:this.isInitialized,isShuttingDown:this.isShuttingDown,currentScene:this.sceneManager?.getCurrentSceneName(),isAuthenticated:this.authManager?.isAuthenticated(),gameRunning:this.gameManager?.isRunning,performance:e?.summary||null,isDevelopmentMode:this.IS_DEV_MODE}}}async function F(){try{if(console.log("🚀 Iniciando aplicación..."),p.init(),console.log("📱 Sistema responsivo inicializado"),await re(),!document.getElementById("gameCanvas"))throw new Error("Canvas del juego no encontrado en el DOM");console.log("✅ Canvas encontrado, creando ApplicationController...");const e=new ne;console.log("✅ ApplicationController creado, inicializando..."),await e.initialize(),console.log("✅ Aplicación inicializada correctamente"),(window.location.hostname==="localhost"||window.location.hostname==="127.0.0.1")&&(window.debugController=e,console.log("🐛 Debug controller disponible como window.debugController"))}catch(h){console.error("❌ Error fatal al inicializar la aplicación:",h),se(h)}}function se(h){document.body.innerHTML='<div style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); color: #ffffff; font-family: Arial, sans-serif; text-align: center; padding: 20px;"><div style="background: rgba(255, 0, 0, 0.1); border: 2px solid #ff4444; border-radius: 10px; padding: 30px; max-width: 600px; margin-bottom: 20px;"><h1 style="color: #ff4444; margin-top: 0;">⚠️ Error de Inicialización</h1><p style="font-size: 18px; margin-bottom: 20px;">No se pudo inicializar la aplicación correctamente.</p><p style="font-size: 14px; color: #cccccc; margin-bottom: 20px;">Error técnico: '+(h.message||h)+'</p><button onclick="window.location.reload()" style="background: #4CAF50; color: white; border: none; padding: 12px 24px; border-radius: 5px; cursor: pointer; font-size: 16px; margin: 10px;">🔄 Reintentar</button><button onclick="toggleErrorDetails()" style="background: #2196F3; color: white; border: none; padding: 12px 24px; border-radius: 5px; cursor: pointer; font-size: 16px; margin: 10px;">🔍 Ver Detalles</button></div><div id="errorDetails" style="display: none; background: rgba(0, 0, 0, 0.3); border: 1px solid #666; border-radius: 5px; padding: 20px; max-width: 800px; max-height: 300px; overflow-y: auto; text-align: left;"><h3>Stack Trace:</h3><pre style="white-space: pre-wrap; word-wrap: break-word; font-size: 12px; color: #ff9999;">'+(h.stack||"No hay stack trace disponible")+"</pre></div></div>",window.toggleErrorDetails=function(){const e=document.getElementById("errorDetails");e.style.display=e.style.display==="none"?"block":"none"}}window.addEventListener("unhandledrejection",h=>{console.error("❌ Promise rechazada no capturada:",{reason:h.reason,promise:h.promise}),h.preventDefault()});function re(){return new Promise(h=>{if(typeof anime<"u"){console.log("✅ anime.js ya está disponible"),h();return}console.log("⏳ Esperando a que anime.js se cargue...");const e=setInterval(()=>{typeof anime<"u"&&(console.log("✅ anime.js cargado correctamente"),clearInterval(e),h())},50);setTimeout(()=>{clearInterval(e),console.warn("⚠️ anime.js no se cargó en 5 segundos, continuando sin él"),h()},5e3)})}window.addEventListener("error",h=>{console.error("❌ Error JavaScript no capturado:",{message:h.message,source:h.filename,line:h.lineno,column:h.colno,error:h.error})});function oe(){document.readyState==="loading"?document.addEventListener("DOMContentLoaded",F):F()}oe();
