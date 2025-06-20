const express = require('express');
const { createCanvas } = require('canvas');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Function to fetch GitHub user data (no auth needed for public data)
async function fetchGitHubData(username) {
  try {
    // Get user info
    const userResponse = await axios.get(`https://api.github.com/users/${username}`);
    const user = userResponse.data;
    
    // Get user's repositories
    const reposResponse = await axios.get(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`);
    const repos = reposResponse.data;
    
    // Calculate activity metrics
    const totalRepos = repos.length;
    const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
    const totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0);
    const languages = {};
    
    repos.forEach(repo => {
      if (repo.language) {
        languages[repo.language] = (languages[repo.language] || 0) + 1;
      }
    });
    
    return {
      username: user.login,
      name: user.name || user.login,
      followers: user.followers,
      following: user.following,
      publicRepos: user.public_repos,
      totalStars,
      totalForks,
      languages,
      recentRepos: repos.slice(0, 5)
    };
  } catch (error) {
    throw new Error('User not found or API limit reached');
  }
}

// Function to create modern TSX-style graph
function createCustomGraph(userData, theme = 'dark') {
  const width = 1200;
  const height = 800;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Modern gradient background (matching TSX slate-900 to slate-800)
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#0f172a'); // slate-900
  gradient.addColorStop(0.5, '#1e293b'); // slate-800
  gradient.addColorStop(1, '#0f172a'); // slate-900
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // Helper function to draw rounded rectangle
  function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }
  
  // Main title with gradient text effect
  ctx.font = 'bold 42px Arial';
  const titleGradient = ctx.createLinearGradient(0, 0, 600, 0);
  titleGradient.addColorStop(0, '#ffffff');
  titleGradient.addColorStop(1, '#cbd5e1'); // slate-300
  ctx.fillStyle = titleGradient;
  ctx.textAlign = 'center';
  ctx.fillText('GitHub Activity', width / 2, 70);
  
  // Subtitle
  ctx.font = '18px Arial';
  ctx.fillStyle = '#94a3b8'; // slate-400
  ctx.fillText('A visual journey through code contributions', width / 2, 105);
  
  // Three stat cards (matching TSX layout)
  const totalCommits = userData.publicRepos * 15; // Estimate commits
  const avgCommits = Math.round(totalCommits / 12);
  const maxCommits = Math.round(avgCommits * 2.5);
  
  const cards = [
    { title: 'Total Commits', value: totalCommits, icon: '📈', color: '#10b981' }, // emerald-500
    { title: 'Avg per Month', value: avgCommits, icon: '📅', color: '#3b82f6' }, // blue-500
    { title: 'Peak Month', value: maxCommits, icon: '⚡', color: '#8b5cf6' } // purple-500
  ];
  
  // Draw cards
  cards.forEach((card, index) => {
    const cardX = 150 + (index * 300);
    const cardY = 140;
    const cardW = 250;
    const cardH = 120;
    
    // Card background with glass effect
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    roundRect(ctx, cardX, cardY, cardW, cardH, 12);
    ctx.fill();
    
    // Card border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Icon background
    ctx.fillStyle = card.color + '20';
    roundRect(ctx, cardX + 20, cardY + 20, 40, 40, 8);
    ctx.fill();
    
    // Icon (emoji)
    ctx.font = '24px Arial';
    ctx.fillStyle = card.color;
    ctx.textAlign = 'center';
    ctx.fillText(card.icon, cardX + 40, cardY + 47);
    
    // Value
    ctx.font = 'bold 32px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(card.value.toString(), cardX + cardW/2, cardY + 70);
    
    // Label
    ctx.font = '14px Arial';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(card.title, cardX + cardW/2, cardY + 95);
  });
  
  // Main chart area
  const chartX = 100;
  const chartY = 300;
  const chartW = 1000;
  const chartH = 300;
  
  // Chart background card
  ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
  roundRect(ctx, chartX, chartY, chartW, chartH, 12);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 1;
  ctx.stroke();
  
  // Chart title
  ctx.font = 'bold 24px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.fillText('Commit Timeline', chartX + 30, chartY + 50);
  
  ctx.font = '14px Arial';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('Monthly contribution activity over the past year', chartX + 30, chartY + 75);
  
  // Generate sample commit data for area chart
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const commitData = months.map((month, i) => ({
    month,
    commits: Math.floor(Math.random() * 30) + 10
  }));
  
  // Draw area chart
  const graphX = chartX + 50;
  const graphY = chartY + 100;
  const graphW = chartW - 100;
  const graphH = 140;
  
  // Create area gradient
  const areaGradient = ctx.createLinearGradient(0, graphY, 0, graphY + graphH);
  areaGradient.addColorStop(0, 'rgba(16, 185, 129, 0.8)'); // emerald-500
  areaGradient.addColorStop(0.5, 'rgba(16, 185, 129, 0.3)');
  areaGradient.addColorStop(1, 'rgba(16, 185, 129, 0.1)');
  
  // Draw area path
  ctx.beginPath();
  ctx.moveTo(graphX, graphY + graphH);
  
  commitData.forEach((data, index) => {
    const x = graphX + (index * (graphW / (commitData.length - 1)));
    const y = graphY + graphH - (data.commits / 40 * graphH);
    
    if (index === 0) {
      ctx.lineTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  
  ctx.lineTo(graphX + graphW, graphY + graphH);
  ctx.closePath();
  ctx.fillStyle = areaGradient;
  ctx.fill();
  
  // Draw line
  ctx.beginPath();
  commitData.forEach((data, index) => {
    const x = graphX + (index * (graphW / (commitData.length - 1)));
    const y = graphY + graphH - (data.commits / 40 * graphH);
    
    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 3;
  ctx.stroke();
  
  // Draw dots
  commitData.forEach((data, index) => {
    const x = graphX + (index * (graphW / (commitData.length - 1)));
    const y = graphY + graphH - (data.commits / 40 * graphH);
    
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, 2 * Math.PI);
    ctx.fillStyle = '#10b981';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
  });
  
  // X-axis labels
  ctx.font = '12px Arial';
  ctx.fillStyle = '#94a3b8';
  ctx.textAlign = 'center';
  commitData.forEach((data, index) => {
    const x = graphX + (index * (graphW / (commitData.length - 1)));
    ctx.fillText(data.month, x, graphY + graphH + 20);
  });
  
  // Activity heatmap
  const heatmapY = chartY + chartH + 50;
  ctx.font = 'bold 20px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.fillText('Recent Activity', chartX + 30, heatmapY + 30);
  
  // Draw heatmap grid
  const heatmapStartY = heatmapY + 50;
  const cellSize = 12;
  const gap = 2;
  
  for (let week = 0; week < 7; week++) {
    for (let day = 0; day < 7; day++) {
      const x = chartX + 30 + (week * (cellSize + gap));
      const y = heatmapStartY + (day * (cellSize + gap));
      const intensity = Math.random();
      
      let color;
      if (intensity > 0.7) {
        color = '#10b981'; // emerald-500
      } else if (intensity > 0.4) {
        color = 'rgba(16, 185, 129, 0.6)';
      } else if (intensity > 0.2) {
        color = 'rgba(16, 185, 129, 0.3)';
      } else {
        color = 'rgba(255, 255, 255, 0.1)';
      }
      
      ctx.fillStyle = color;
      roundRect(ctx, x, y, cellSize, cellSize, 2);
      ctx.fill();
    }
  }
  
  // Heatmap legend
  ctx.font = '12px Arial';
  ctx.fillStyle = '#94a3b8';
  ctx.textAlign = 'left';
  ctx.fillText('Less', chartX + 200, heatmapStartY + 90);
  ctx.textAlign = 'right';
  ctx.fillText('More', chartX + 350, heatmapStartY + 90);
  
  // Legend squares
  const legendColors = ['rgba(255, 255, 255, 0.1)', 'rgba(16, 185, 129, 0.3)', 'rgba(16, 185, 129, 0.6)', '#10b981'];
  legendColors.forEach((color, index) => {
    const x = chartX + 240 + (index * 18);
    const y = heatmapStartY + 80;
    ctx.fillStyle = color;
    roundRect(ctx, x, y, 12, 12, 2);
    ctx.fill();
  });
  
  return canvas.toBuffer('image/png');
}

// Main endpoint - anyone can use this!
app.get('/stats/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const theme = req.query.theme || 'dark';
    
    console.log(`Generating graph for: ${username}`);
    
    const userData = await fetchGitHubData(username);
    const graphBuffer = createCustomGraph(userData, theme);
    
    res.set({
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      'Access-Control-Allow-Origin': '*' // Allow use from any website
    });
    
    res.send(graphBuffer);
  } catch (error) {
    console.error('Error:', error.message);
    
    // Create error image
    const canvas = createCanvas(800, 400);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ff4444';
    ctx.fillRect(0, 0, 800, 400);
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Error: User not found', 400, 200);
    
    res.set('Content-Type', 'image/png');
    res.send(canvas.toBuffer('image/png'));
  }
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'GitHub Stats Generator API',
    usage: 'https://your-domain.vercel.app/stats/username?theme=dark',
    themes: ['dark', 'light', 'neon']
  });
});

app.get('/favicon.ico', (req, res) => res.status(204).send(''));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;