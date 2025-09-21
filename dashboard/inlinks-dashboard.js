// Inlinks Dashboard JavaScript

function initializeInlinksDashboard(dashboardData) {
    console.log('Initializing Inlinks Dashboard...');
    
    const inlinksData = dashboardData.inlinks || {};
    
    // Update overview stats
    updateInlinksOverview(inlinksData);
    
    // Initialize charts
    initializeDomainChart(inlinksData);
    initializeHeatmap(inlinksData);
    initializeConnectivityGraph(inlinksData);
    
    // Load tab data
    loadInternalLinksTab(inlinksData);
    loadEverAfterTab(inlinksData);
    loadExternalTab(inlinksData);
    loadAnalysisTab(inlinksData);
    
    // Initialize search
    initializeInlinksSearch();
}

function updateInlinksOverview(data) {
    if (data.summary) {
        document.getElementById('totalInternalLinks').textContent = 
            data.summary.total_internal_links || '0';
        document.getElementById('totalEverAfterLinks').textContent = 
            data.summary.total_everafter_links || '0';
        document.getElementById('totalExternalLinks').textContent = 
            data.summary.total_external_links || '0';
        document.getElementById('pagesAnalyzed').textContent = 
            data.summary.total_pages_analyzed || '0';
    }
}

function initializeDomainChart(data) {
    const ctx = document.getElementById('domainChart');
    if (!ctx || !data.external_links) return;
    
    // Get top 10 external domains
    const domains = Object.entries(data.external_links || {})
        .map(([domain, links]) => ({
            domain: domain,
            count: links.length
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: domains.map(d => d.domain),
            datasets: [{
                data: domains.map(d => d.count),
                backgroundColor: [
                    '#3498db', '#2ecc71', '#f39c12', '#e74c3c', '#9b59b6',
                    '#1abc9c', '#34495e', '#f1c40f', '#e67e22', '#95a5a6'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Top External Domains by Link Count'
                },
                legend: {
                    position: 'right'
                }
            }
        }
    });
}

function initializeHeatmap(data) {
    const canvas = document.getElementById('internalHeatmapCanvas');
    if (!canvas || !data.pages) return;
    
    const ctx = canvas.getContext('2d');
    
    // Simple heatmap visualization
    // This is a placeholder - you'd want a more sophisticated heatmap library
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw some sample heatmap data
    const pages = Object.keys(data.pages).slice(0, 20);
    const cellSize = 20;
    const margin = 5;
    
    pages.forEach((page, i) => {
        pages.forEach((targetPage, j) => {
            const intensity = Math.random(); // Replace with actual link data
            ctx.fillStyle = `rgba(52, 152, 219, ${intensity})`;
            ctx.fillRect(
                margin + j * (cellSize + 2),
                margin + i * (cellSize + 2),
                cellSize,
                cellSize
            );
        });
    });
}

function initializeConnectivityGraph(data) {
    const canvas = document.getElementById('connectivityGraph');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Simple network visualization placeholder
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw nodes
    const nodes = [
        { x: 400, y: 300, label: 'Italy', size: 45 },
        { x: 300, y: 200, label: 'Greece', size: 38 },
        { x: 500, y: 200, label: 'India', size: 35 },
        { x: 350, y: 400, label: 'Mexico', size: 32 },
        { x: 450, y: 400, label: 'Japan', size: 30 }
    ];
    
    // Draw connections
    ctx.strokeStyle = '#bdc3c7';
    ctx.lineWidth = 1;
    nodes.forEach((node, i) => {
        nodes.forEach((target, j) => {
            if (i < j) {
                ctx.beginPath();
                ctx.moveTo(node.x, node.y);
                ctx.lineTo(target.x, target.y);
                ctx.stroke();
            }
        });
    });
    
    // Draw nodes
    nodes.forEach(node => {
        ctx.fillStyle = '#3498db';
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.fillStyle = '#2c3e50';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(node.label, node.x, node.y + 4);
    });
}

function loadInternalLinksTab(data) {
    // Update top linked pages
    if (data.top_linked && data.top_linked.internal) {
        const container = document.getElementById('topInternalLinks');
        if (container) {
            container.innerHTML = data.top_linked.internal
                .slice(0, 5)
                .map(([target, count]) => `
                    <div class="top-linked-item">
                        <span class="link-target">${target}</span>
                        <span class="link-count">${count} inlinks</span>
                    </div>
                `).join('');
        }
    }
    
    // Load internal links table
    const tbody = document.querySelector('#internalLinksTable tbody');
    if (tbody && data.internal_links) {
        tbody.innerHTML = '';
        
        Object.entries(data.internal_links).forEach(([target, sources]) => {
            sources.forEach(source => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${formatFileName(source.from)}</td>
                    <td>${target}</td>
                    <td>${source.text || 'No text'}</td>
                    <td>1</td>
                `;
                tbody.appendChild(row);
            });
        });
    }
}

function loadEverAfterTab(data) {
    // Update EverAfter stats
    if (data.summary) {
        document.getElementById('everafterTotal').textContent = 
            data.summary.total_everafter_links || '0';
        document.getElementById('everafterUnique').textContent = 
            data.summary.unique_everafter_targets || '0';
        
        const everafterPages = Object.values(data.pages || {})
            .filter(page => page.everafter_links > 0).length;
        document.getElementById('everafterPages').textContent = everafterPages;
    }
    
    // Update top EverAfter links
    if (data.top_linked && data.top_linked.everafter) {
        const container = document.getElementById('topEverAfterLinks');
        if (container) {
            container.innerHTML = data.top_linked.everafter
                .slice(0, 5)
                .map(([target, count]) => `
                    <div class="everafter-item">
                        <span class="link-target">${target}</span>
                        <span class="link-count">${count} links</span>
                    </div>
                `).join('');
        }
    }
    
    // Load EverAfter links table
    const tbody = document.querySelector('#everafterLinksTable tbody');
    if (tbody && data.everafter_links) {
        tbody.innerHTML = '';
        
        Object.entries(data.everafter_links).forEach(([target, sources]) => {
            sources.forEach(source => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${formatFileName(source.from)}</td>
                    <td>${target}</td>
                    <td>${source.text || 'No text'}</td>
                    <td>Navigation/Content</td>
                `;
                tbody.appendChild(row);
            });
        });
    }
}

function loadExternalTab(data) {
    // Update external domains grid
    if (data.external_links) {
        const container = document.getElementById('topExternalDomains');
        if (container) {
            const domains = Object.entries(data.external_links)
                .map(([domain, links]) => ({
                    domain: domain,
                    linkCount: links.length,
                    pageCount: new Set(links.map(l => l.from)).size
                }))
                .sort((a, b) => b.linkCount - a.linkCount)
                .slice(0, 6);
            
            container.innerHTML = domains.map(d => `
                <div class="domain-card">
                    <div class="domain-name">${d.domain}</div>
                    <div class="domain-stats">
                        <span>${d.linkCount} links</span>
                        <span>${d.pageCount} pages</span>
                    </div>
                </div>
            `).join('');
        }
    }
    
    // Load external links table
    const tbody = document.querySelector('#externalLinksTable tbody');
    if (tbody && data.external_links) {
        tbody.innerHTML = '';
        
        Object.entries(data.external_links).forEach(([domain, links]) => {
            links.forEach(link => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${formatFileName(link.from)}</td>
                    <td>${domain}</td>
                    <td><a href="${link.href}" target="_blank" class="external-link">${link.href}</a></td>
                    <td>${link.text || 'No text'}</td>
                `;
                tbody.appendChild(row);
            });
        });
    }
}

function loadAnalysisTab(data) {
    // Calculate metrics
    if (data.summary && data.pages) {
        const totalPages = data.summary.total_pages_analyzed || 1;
        
        // Internal link density
        const internalDensity = (data.summary.total_internal_links / totalPages).toFixed(1);
        document.querySelector('.metric-card:nth-child(1) .metric-value').textContent = 
            `${internalDensity} links/page`;
        
        // EverAfter integration
        const everafterDensity = (data.summary.total_everafter_links / totalPages).toFixed(1);
        document.querySelector('.metric-card:nth-child(2) .metric-value').textContent = 
            `${everafterDensity} links/page`;
        
        // External link ratio
        const totalLinks = data.summary.total_internal_links + 
                          data.summary.total_everafter_links + 
                          data.summary.total_external_links;
        const externalRatio = totalLinks > 0 ? 
            ((data.summary.total_external_links / totalLinks) * 100).toFixed(0) : 0;
        document.querySelector('.metric-card:nth-child(3) .metric-value').textContent = 
            `${externalRatio}%`;
        
        // Orphan pages (pages with no inlinks)
        const pagesWithInlinks = new Set();
        Object.values(data.internal_links || {}).forEach(sources => {
            sources.forEach(source => {
                pagesWithInlinks.add(source.from);
            });
        });
        const orphanCount = totalPages - pagesWithInlinks.size;
        document.querySelector('.metric-card:nth-child(4) .metric-value').textContent = 
            orphanCount.toString();
    }
}

function initializeInlinksSearch() {
    const searchInput = document.getElementById('internalSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const rows = document.querySelectorAll('#internalLinksTable tbody tr');
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        });
    }
}

// Helper functions
function formatFileName(filename) {
    return filename
        .replace('.html', '')
        .replace('-wedding-traditions', '')
        .replace(/-/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// Add additional styles
const style = document.createElement('style');
style.textContent = `
    .top-linked-item {
        display: flex;
        justify-content: space-between;
        padding: 0.75rem;
        background-color: #f8f9fa;
        border-radius: 4px;
        margin-bottom: 0.5rem;
    }
    
    .link-target {
        font-weight: 500;
        color: #2c3e50;
    }
    
    .link-count {
        color: #7f8c8d;
        font-size: 0.875rem;
    }
    
    .everafter-item {
        display: flex;
        justify-content: space-between;
        padding: 0.75rem;
        background-color: rgba(52, 152, 219, 0.05);
        border-radius: 4px;
        margin-bottom: 0.5rem;
        border-left: 3px solid #3498db;
    }
    
    .domain-card {
        background-color: #f8f9fa;
        padding: 1rem;
        border-radius: 8px;
        text-align: center;
    }
    
    .domain-name {
        font-weight: 600;
        color: #2c3e50;
        margin-bottom: 0.5rem;
    }
    
    .domain-stats {
        display: flex;
        justify-content: space-around;
        font-size: 0.875rem;
        color: #7f8c8d;
    }
    
    .external-link {
        color: #3498db;
        text-decoration: none;
        font-size: 0.875rem;
    }
    
    .external-link:hover {
        text-decoration: underline;
    }
    
    .metric-card {
        background-color: #fff;
        border: 1px solid #e0e6ed;
        border-radius: 8px;
        padding: 1.5rem;
        text-align: center;
    }
    
    .metric-card h4 {
        font-size: 0.875rem;
        color: #7f8c8d;
        margin-bottom: 0.5rem;
    }
    
    .metric-value {
        font-size: 1.5rem;
        font-weight: 600;
        color: #2c3e50;
        margin-bottom: 0.5rem;
    }
    
    .metric-status {
        font-size: 0.875rem;
        padding: 0.25rem 0.75rem;
        border-radius: 4px;
    }
    
    .metric-status.good {
        background-color: rgba(39, 174, 96, 0.1);
        color: #27ae60;
    }
    
    .recommendation {
        display: flex;
        gap: 1rem;
        padding: 1rem;
        background-color: #f8f9fa;
        border-radius: 8px;
        margin-bottom: 1rem;
    }
    
    .rec-icon {
        font-size: 1.5rem;
    }
    
    .rec-content h4 {
        margin-bottom: 0.25rem;
        color: #2c3e50;
    }
    
    .rec-content p {
        color: #7f8c8d;
        font-size: 0.875rem;
    }
`;
document.head.appendChild(style);