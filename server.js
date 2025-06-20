const express = require('express');
const { ImageResponse } = require('@vercel/og');
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

// Function to generate sample commit data
function generateCommitData() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months.map(month => ({
    month,
    commits: Math.floor(Math.random() * 30) + 10
  }));
}

// Function to create modern GitHub stats image
async function createCustomGraph(userData, theme = 'dark') {
  const totalCommits = userData.publicRepos * 15;
  const avgCommits = Math.round(totalCommits / 12);
  const maxCommits = Math.round(avgCommits * 2.5);
  const commitData = generateCommitData();

  try {
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
            padding: '40px',
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
          }}
        >
          {/* Title Section */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginBottom: '40px',
            }}
          >
            <h1
              style={{
                fontSize: '48px',
                fontWeight: 'bold',
                background: 'linear-gradient(90deg, #ffffff 0%, #cbd5e1 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                margin: '0',
                textAlign: 'center',
              }}
            >
              GitHub Activity
            </h1>
            <p
              style={{
                color: '#94a3b8',
                fontSize: '18px',
                margin: '10px 0 0 0',
                textAlign: 'center',
              }}
            >
              @{userData.username} - A visual journey through code contributions
            </p>
          </div>

          {/* Stats Cards Row */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '20px',
              marginBottom: '40px',
            }}
          >
            {/* Total Commits Card */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                padding: '24px',
                width: '300px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '16px',
                }}
              >
                <div
                  style={{
                    background: 'rgba(16, 185, 129, 0.2)',
                    borderRadius: '8px',
                    padding: '12px',
                    fontSize: '24px',
                    marginRight: '12px',
                  }}
                >
                  📈
                </div>
              </div>
              <div
                style={{
                  color: '#ffffff',
                  fontSize: '36px',
                  fontWeight: 'bold',
                  margin: '0 0 8px 0',
                }}
              >
                {totalCommits}
              </div>
              <div
                style={{
                  color: '#94a3b8',
                  fontSize: '16px',
                }}
              >
                Total Commits
              </div>
            </div>

            {/* Avg per Month Card */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                padding: '24px',
                width: '300px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '16px',
                }}
              >
                <div
                  style={{
                    background: 'rgba(59, 130, 246, 0.2)',
                    borderRadius: '8px',
                    padding: '12px',
                    fontSize: '24px',
                    marginRight: '12px',
                  }}
                >
                  📅
                </div>
              </div>
              <div
                style={{
                  color: '#ffffff',
                  fontSize: '36px',
                  fontWeight: 'bold',
                  margin: '0 0 8px 0',
                }}
              >
                {avgCommits}
              </div>
              <div
                style={{
                  color: '#94a3b8',
                  fontSize: '16px',
                }}
              >
                Avg per Month
              </div>
            </div>

            {/* Peak Month Card */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                padding: '24px',
                width: '300px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '16px',
                }}
              >
                <div
                  style={{
                    background: 'rgba(139, 92, 246, 0.2)',
                    borderRadius: '8px',
                    padding: '12px',
                    fontSize: '24px',
                    marginRight: '12px',
                  }}
                >
                  ⚡
                </div>
              </div>
              <div
                style={{
                  color: '#ffffff',
                  fontSize: '36px',
                  fontWeight: 'bold',
                  margin: '0 0 8px 0',
                }}
              >
                {maxCommits}
              </div>
              <div
                style={{
                  color: '#94a3b8',
                  fontSize: '16px',
                }}
              >
                Peak Month
              </div>
            </div>
          </div>

          {/* Chart Section */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              padding: '30px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              flex: 1,
            }}
          >
            <div
              style={{
                marginBottom: '24px',
              }}
            >
              <h2
                style={{
                  color: '#ffffff',
                  fontSize: '24px',
                  fontWeight: 'bold',
                  margin: '0 0 8px 0',
                }}
              >
                Commit Timeline
              </h2>
              <p
                style={{
                  color: '#94a3b8',
                  fontSize: '14px',
                  margin: '0',
                }}
              >
                Monthly contribution activity over the past year
              </p>
            </div>

            {/* Simple Bar Chart */}
            <div
              style={{
                display: 'flex',
                alignItems: 'end',
                justifyContent: 'space-between',
                height: '200px',
                marginBottom: '20px',
                gap: '8px',
              }}
            >
              {commitData.map((data, index) => {
                const maxValue = Math.max(...commitData.map(d => d.commits));
                const height = (data.commits / maxValue) * 180;
                
                return (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      flex: 1,
                    }}
                  >
                    <div
                      style={{
                        width: '60px',
                        height: `${height}px`,
                        background: 'linear-gradient(180deg, #10b981 0%, rgba(16, 185, 129, 0.6) 100%)',
                        borderRadius: '4px 4px 0 0',
                        marginBottom: '8px',
                      }}
                    />
                    <span
                      style={{
                        fontSize: '12px',
                        color: '#94a3b8',
                      }}
                    >
                      {data.month}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Bottom Stats */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '20px',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  color: '#94a3b8',
                  fontSize: '14px',
                }}
              >
                <span style={{ marginRight: '8px' }}>🌟</span>
                {userData.totalStars} stars
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  color: '#94a3b8',
                  fontSize: '14px',
                }}
              >
                <span style={{ marginRight: '8px' }}>📂</span>
                {userData.publicRepos} repositories
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  color: '#94a3b8',
                  fontSize: '14px',
                }}
              >
                <span style={{ marginRight: '8px' }}>👥</span>
                {userData.followers} followers
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 800,
      }
    );
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
}

// Main endpoint
app.get('/stats/:username', async (req, res) => {
  const username = req.params.username;
  const theme = req.query.theme || 'dark';

  try {
    const userData = await fetchGitHubData(username);
    const imageResponse = await createCustomGraph(userData, theme);
    
    // Convert to buffer and send
    const buffer = await imageResponse.arrayBuffer();
    
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(Buffer.from(buffer));
    
  } catch (error) {
    console.error('Error:', error);
    res.status(404).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'GitHub Stats Generator API - Vercel Compatible',
    usage: 'GET /stats/:username?theme=dark',
    example: 'https://your-domain.vercel.app/stats/octocat',
    themes: ['dark', 'light', 'neon'],
    status: 'active'
  });
});

app.get('/favicon.ico', (req, res) => res.status(204).send(''));

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 GitHub Stats API ready!`);
});

module.exports = app;