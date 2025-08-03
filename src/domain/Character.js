export default class Character {
    constructor(id, name, position, health, superMeter) {
        this.id = id;
        this.name = name;
        this.position = position; // { x: number, y: number }
        this.health = health;
        this.superMeter = superMeter;
        this.state = 'idle';
        this.velocity = { x: 0, y: 0 };
        this.isGrounded = true;
        this.isFlipped = false;
    }

    update(deltaTime) {
        // Actualizar posición y estado del personaje
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;

        // Aplicar lógica de gravedad
        if (!this.isGrounded) {
            this.velocity.y += 9.8 * deltaTime; // Gravedad
        }
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.state = 'knockedOut';
        }
    }

    attack() {
        // Lógica de ataque
        this.state = 'attacking';
    }
}