export default class AdminDashboardScene {
    render() {
        const container = document.createElement('div');
        container.style.textAlign = 'center';
        container.style.color = 'white';

        const title = document.createElement('h1');
        title.textContent = 'Panel de Administración';
        container.appendChild(title);

        const description = document.createElement('p');
        description.textContent = 'Aquí puedes gestionar personajes, escenarios y música.';
        container.appendChild(description);

        document.body.appendChild(container);
    }
}