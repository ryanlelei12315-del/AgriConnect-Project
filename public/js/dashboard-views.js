// ══ DASHBOARD SPA VIEW TEMPLATES ══
window.DASHBOARD_VIEWS = {
  overview: `
    <!-- Greeting Banner and Weather -->
    <div class="greeting-section">
      <div class="greeting-text">
        <h1 id="dash-greeting">Good morning, John! 👋</h1>
        <p>Welcome back! Here's what's happening with your farm today.</p>
      </div>

      <!-- Weather Widget -->
      <div class="weather-widget">
        <div class="weather-icon">
          <i data-lucide="cloud-rain"></i>
        </div>
        <div class="weather-info">
          <span class="weather-date" id="weather-date">Tuesday, 13 May 2025</span>
          <span class="weather-temp"><strong>24°C</strong> Light Rain</span>
        </div>
      </div>
    </div>

    <!-- Stat Cards Row -->
    <div class="dash-stats-row">
      <div class="stat-card-new">
        <div class="stat-icon-wrapper green">
          <i data-lucide="shopping-basket"></i>
        </div>
        <div class="stat-details">
          <div class="stat-number" id="stat-produce">12</div>
          <div class="stat-title">Active Listings</div>
          <div class="stat-trend up">
            <i data-lucide="arrow-up" style="width:12px; height:12px;"></i>
            <span>+2 this week</span>
          </div>
        </div>
      </div>

      <div class="stat-card-new">
        <div class="stat-icon-wrapper blue">
          <i data-lucide="shopping-bag"></i>
        </div>
        <div class="stat-details">
          <div class="stat-number" id="stat-orders">8</div>
          <div class="stat-title">Orders Received</div>
          <div class="stat-trend up">
            <i data-lucide="arrow-up" style="width:12px; height:12px;"></i>
            <span>+3 this week</span>
          </div>
        </div>
      </div>

      <div class="stat-card-new">
        <div class="stat-icon-wrapper yellow">
          <i data-lucide="tractor"></i>
        </div>
        <div class="stat-details">
          <div class="stat-number">5</div>
          <div class="stat-title">Services Requested</div>
          <div class="stat-trend up">
            <i data-lucide="arrow-up" style="width:12px; height:12px;"></i>
            <span>+1 this week</span>
          </div>
        </div>
      </div>

      <div class="stat-card-new">
        <div class="stat-icon-wrapper purple">
          <i data-lucide="credit-card"></i>
        </div>
        <div class="stat-details">
          <div class="stat-number">KES 28,450</div>
          <div class="stat-title">Total Earnings</div>
          <div class="stat-trend up">
            <i data-lucide="arrow-up" style="width:12px; height:12px;"></i>
            <span>+18% this month</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Two-Column Layout Grid -->
    <div class="dash-layout-grid">
      <!-- Left Column (2/3 width) -->
      <div class="dash-left-column">
        
        <!-- Earnings Overview Panel -->
        <div class="dash-panel">
          <div class="panel-header">
            <h3 class="panel-title">Earnings Overview</h3>
            <select class="panel-select">
              <option>This Month</option>
              <option>Last Month</option>
              <option>This Year</option>
            </select>
          </div>
          <div class="chart-container">
            <canvas id="earningsChart"></canvas>
          </div>
        </div>

        <!-- Recent Tables Panel (Split grid: Orders & Service Requests) -->
        <div class="bottom-split-panels">
          <!-- Recent Orders Panel -->
          <div class="dash-panel">
            <div class="panel-header">
              <h3 class="panel-title">Recent Orders</h3>
              <a href="#" class="panel-action-link" onclick="switchView('view-purchase-requests')">View All</a>
            </div>
            <div class="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Produce</th>
                    <th>Quantity</th>
                    <th>Status</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div class="table-item-detail">
                        <div class="table-item-icon">🍅</div>
                        <span>Tomatoes</span>
                      </div>
                    </td>
                    <td>120 kg</td>
                    <td><span class="status-badge completed">Completed</span></td>
                    <td style="font-weight:600;">KES 9,600</td>
                  </tr>
                  <tr>
                    <td>
                      <div class="table-item-detail">
                        <div class="table-item-icon">🌽</div>
                        <span>Maize</span>
                      </div>
                    </td>
                    <td>200 kg</td>
                    <td><span class="status-badge processing">Processing</span></td>
                    <td style="font-weight:600;">KES 8,400</td>
                  </tr>
                  <tr>
                    <td>
                      <div class="table-item-detail">
                        <div class="table-item-icon">🥔</div>
                        <span>Potatoes</span>
                      </div>
                    </td>
                    <td>150 kg</td>
                    <td><span class="status-badge pending">Pending</span></td>
                    <td style="font-weight:600;">KES 6,750</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Recent Service Requests Panel -->
          <div class="dash-panel">
            <div class="panel-header">
              <h3 class="panel-title">Recent Service Requests</h3>
              <a href="#" class="panel-action-link" onclick="switchView('view-service-requests')">View All</a>
            </div>
            <div class="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div class="table-item-detail">
                        <div class="table-item-icon">🚜</div>
                        <span>Tractor Plowing</span>
                      </div>
                    </td>
                    <td>12 May 2025</td>
                    <td><span class="status-badge completed">Accepted</span></td>
                  </tr>
                  <tr>
                    <td>
                      <div class="table-item-detail">
                        <div class="table-item-icon">🚛</div>
                        <span>Transport Service</span>
                      </div>
                    </td>
                    <td>11 May 2025</td>
                    <td><span class="status-badge processing">In Progress</span></td>
                  </tr>
                  <tr>
                    <td>
                      <div class="table-item-detail">
                        <div class="table-item-icon">💧</div>
                        <span>Irrigation Installation</span>
                      </div>
                    </td>
                    <td>10 May 2025</td>
                    <td><span class="status-badge pending">Pending</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Promo Banner Card -->
        <div class="promo-banner-card">
          <div class="promo-content">
            <h3 class="promo-title">Grow your business with AgriConnect KE</h3>
            <p class="promo-text">List more produce and connect with verified buyers and service providers across Kenya. Boost your trade, track earnings, and manage your crop cycles smoothly.</p>
            <a href="#" class="btn promo-btn" onclick="switchView('view-browse-produce')">
              Explore Marketplace <i class="chevron-arrow" data-lucide="arrow-right" style="width: 16px; height: 16px; margin-left: 6px; vertical-align: middle;"></i>
            </a>
          </div>
          <div class="promo-illustration">
            <svg viewBox="0 0 160 120" width="140" height="110" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="80" cy="90" r="50" fill="rgba(255,255,255,0.08)" />
              <path d="M40 90C40 67.9086 57.9086 50 80 50C102.091 50 120 67.9086 120 90H40Z" fill="rgba(255,255,255,0.12)" />
              <rect x="72" y="30" width="16" height="40" rx="4" fill="#F9A825" />
              <path d="M80 20L65 35H95L80 20Z" fill="#F9A825" />
              <path d="M45 90L60 70H100L115 90H45Z" fill="#66BB6A" />
            </svg>
          </div>
        </div>

      </div>

      <!-- Right Column (1/3 width) -->
      <div class="dash-right-column">
        <!-- Quick Actions Panel -->
        <div class="dash-panel">
          <div class="panel-header">
            <h3 class="panel-title">Quick Actions</h3>
          </div>
          <div class="actions-panel-grid">
            <a href="#" class="action-item-new" onclick="switchView('view-post-produce')">
              <div class="action-item-icon green">
                <i data-lucide="plus"></i>
              </div>
              <span class="action-item-label">Post Produce</span>
            </a>
            <a href="#" class="action-item-new" onclick="switchView('view-find-services')">
              <div class="action-item-icon blue">
                <i data-lucide="wrench"></i>
              </div>
              <span class="action-item-label">Find Services</span>
            </a>
            <a href="#" class="action-item-new" onclick="switchView('view-my-produce')">
              <div class="action-item-icon green">
                <i data-lucide="shopping-basket"></i>
              </div>
              <span class="action-item-label">My Produce</span>
            </a>
            <a href="#" class="action-item-new" onclick="switchView('view-my-requests')">
              <div class="action-item-icon yellow">
                <i data-lucide="file-text"></i>
              </div>
              <span class="action-item-label">My Requests</span>
            </a>
            <a href="#" class="action-item-new" onclick="switchView('view-messages')">
              <div class="action-item-icon purple">
                <i data-lucide="message-square"></i>
              </div>
              <span class="action-item-label">Messages</span>
            </a>
            <a href="#" class="action-item-new" onclick="switchView('view-analytics')">
              <div class="action-item-icon teal">
                <i data-lucide="bar-chart-2"></i>
              </div>
              <span class="action-item-label">View Analytics</span>
            </a>
          </div>
        </div>

        <!-- To Do List Panel -->
        <div class="dash-panel">
          <div class="panel-header">
            <h3 class="panel-title">To Do List</h3>
            <a href="#" class="panel-action-link">View All</a>
          </div>
          <div class="todo-list-wrapper">
            <div class="todo-item">
              <div class="todo-check done">
                <i data-lucide="check-circle-2"></i>
              </div>
              <div class="todo-details">
                <div class="todo-title">Complete your profile</div>
                <div class="todo-desc">Add farm information and photos</div>
              </div>
              <div class="todo-arrow"><i data-lucide="chevron-right"></i></div>
            </div>

            <div class="todo-item">
              <div class="todo-check">
                <i data-lucide="circle"></i>
              </div>
              <div class="todo-details">
                <div class="todo-title">Verify your phone number</div>
                <div class="todo-desc">Secure your account</div>
              </div>
              <div class="todo-arrow"><i data-lucide="chevron-right"></i></div>
            </div>

            <div class="todo-item">
              <div class="todo-check">
                <i data-lucide="circle"></i>
              </div>
              <div class="todo-details">
                <div class="todo-title">Add bank details</div>
                <div class="todo-desc">To receive payments</div>
              </div>
              <div class="todo-arrow"><i data-lucide="chevron-right"></i></div>
            </div>

            <div class="todo-item" onclick="switchView('view-post-produce')">
              <div class="todo-check">
                <i data-lucide="circle"></i>
              </div>
              <div class="todo-details">
                <div class="todo-title">Post new produce</div>
                <div class="todo-desc">Increase your visibility</div>
              </div>
              <div class="todo-arrow"><i data-lucide="chevron-right"></i></div>
            </div>
          </div>
        </div>

        <!-- Market Prices Today Panel -->
        <div class="dash-panel">
          <div class="panel-header">
            <h3 class="panel-title">Market Prices (Today)</h3>
            <a href="/#prices" class="panel-action-link">View All</a>
          </div>
          <div class="market-prices-list">
            <div class="market-price-item">
              <div class="market-crop-info">
                <div class="market-crop-img">🌽</div>
                <span class="market-crop-name">Maize</span>
              </div>
              <span class="market-price-value">KES 42 / kg</span>
              <span class="market-price-trend up">+5%</span>
            </div>

            <div class="market-price-item">
              <div class="market-crop-info">
                <div class="market-crop-img">🍅</div>
                <span class="market-crop-name">Tomatoes</span>
              </div>
              <span class="market-price-value">KES 80 / kg</span>
              <span class="market-price-trend up">+8%</span>
            </div>

            <div class="market-price-item">
              <div class="market-crop-info">
                <div class="market-crop-img">🥔</div>
                <span class="market-crop-name">Potatoes</span>
              </div>
              <span class="market-price-value">KES 60 / kg</span>
              <span class="market-price-trend down">-3%</span>
            </div>

            <div class="market-price-item">
              <div class="market-crop-info">
                <div class="market-crop-img">🧅</div>
                <span class="market-crop-name">Onions</span>
              </div>
              <span class="market-price-value">KES 55 / kg</span>
              <span class="market-price-trend up">+2%</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,

  'my-produce': `
    <div class="panel-header" style="margin-bottom: 0;">
      <h1 class="dash-greeting">My Produce Listings</h1>
      <button class="btn btn-fill" style="background: var(--primary);" onclick="switchView('view-post-produce')">
        <i data-lucide="plus-circle"></i> Post New Produce
      </button>
    </div>

    <!-- Success notification if produce added -->
    <div id="produce-success-banner" class="auth-banner success" style="display:none; width: 100%;">
      Produce posted successfully! It is now live in the marketplace.
    </div>

    <div class="table-responsive dash-panel">
      <table>
        <thead>
          <tr>
            <th>Image</th>
            <th>Produce Title</th>
            <th>Quantity Available</th>
            <th>Price per kg</th>
            <th>County Location</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="my-produce-table-body">
          <tr>
            <td><div class="table-item-icon">🌽</div></td>
            <td style="font-weight:600;">White Maize</td>
            <td>500 kg</td>
            <td>KES 55</td>
            <td>Nakuru</td>
            <td><span class="status-badge completed">Active</span></td>
            <td>
              <button class="btn btn-outline" style="padding: 6px 12px; font-size: 0.8rem; border-radius: 6px;" onclick="alert('Edit logic')">Edit</button>
              <button class="btn btn-outline" style="padding: 6px 12px; font-size: 0.8rem; border-radius: 6px; color: #dc2626; border-color: #fca5a5;" onclick="this.closest('tr').remove(); updateProduceStats();">Delete</button>
            </td>
          </tr>
          <tr>
            <td><div class="table-item-icon">🍅</div></td>
            <td style="font-weight:600;">Cherry Tomatoes</td>
            <td>120 kg</td>
            <td>KES 90</td>
            <td>Uasin Gishu</td>
            <td><span class="status-badge completed">Active</span></td>
            <td>
              <button class="btn btn-outline" style="padding: 6px 12px; font-size: 0.8rem; border-radius: 6px;">Edit</button>
              <button class="btn btn-outline" style="padding: 6px 12px; font-size: 0.8rem; border-radius: 6px; color: #dc2626; border-color: #fca5a5;" onclick="this.closest('tr').remove(); updateProduceStats();">Delete</button>
            </td>
          </tr>
          <tr>
            <td><div class="table-item-icon">🥔</div></td>
            <td style="font-weight:600;">Irish Potatoes</td>
            <td>300 kg</td>
            <td>KES 70</td>
            <td>Meru</td>
            <td><span class="status-badge completed">Active</span></td>
            <td>
              <button class="btn btn-outline" style="padding: 6px 12px; font-size: 0.8rem; border-radius: 6px;">Edit</button>
              <button class="btn btn-outline" style="padding: 6px 12px; font-size: 0.8rem; border-radius: 6px; color: #dc2626; border-color: #fca5a5;" onclick="this.closest('tr').remove(); updateProduceStats();">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,

  'browse-produce': `
    <div class="panel-header" style="margin-bottom: 0;">
      <h1 class="dash-greeting">Browse Marketplace</h1>
    </div>

    <!-- Marketplace Filter Bar -->
    <div class="filter-bar">
      <div class="filter-group">
        <label class="filter-label">Category:</label>
        <select class="filter-select">
          <option>All Produce</option>
          <option>Cereals</option>
          <option>Vegetables</option>
          <option>Fruits</option>
          <option>Tubers</option>
        </select>
      </div>
      <div class="filter-group">
        <label class="filter-label">County:</label>
        <select class="filter-select">
          <option>All Counties</option>
          <option>Uasin Gishu</option>
          <option>Nakuru</option>
          <option>Meru</option>
          <option>Kajiado</option>
          <option>Kiambu</option>
        </select>
      </div>
      <div class="filter-group">
        <label class="filter-label">Sort by:</label>
        <select class="filter-select">
          <option>Latest</option>
          <option>Price: Low to High</option>
          <option>Price: High to Low</option>
        </select>
      </div>
    </div>

    <!-- Produce Grid -->
    <div class="product-grid" id="browse-produce-grid">
      <div class="pc-card">
        <div class="pc-img">🍅<span class="pc-tag">Uasin Gishu</span><span class="pc-avail">Active</span></div>
        <div class="pc-body">
          <div class="pc-title">Cherry Tomatoes</div>
          <div class="pc-farmer">Posted by John Kamau</div>
          <div class="pc-bottom">
            <span class="pc-qty">120 kg available</span>
            <span class="pc-price">KES 90<small>/kg</small></span>
          </div>
          <button class="pc-cta" onclick="alert('Purchase Request Submitted!')">Request to Buy</button>
        </div>
      </div>

      <div class="pc-card">
        <div class="pc-img">🌽<span class="pc-tag">Nakuru</span><span class="pc-avail">Active</span></div>
        <div class="pc-body">
          <div class="pc-title">White Maize</div>
          <div class="pc-farmer">Posted by Rift Valley Grains</div>
          <div class="pc-bottom">
            <span class="pc-qty">500 kg available</span>
            <span class="pc-price">KES 55<small>/kg</small></span>
          </div>
          <button class="pc-cta" onclick="alert('Purchase Request Submitted!')">Request to Buy</button>
        </div>
      </div>

      <div class="pc-card">
        <div class="pc-img">🥔<span class="pc-tag">Meru</span><span class="pc-avail">Active</span></div>
        <div class="pc-body">
          <div class="pc-title">Irish Potatoes</div>
          <div class="pc-farmer">Posted by Njagi Agri</div>
          <div class="pc-bottom">
            <span class="pc-qty">300 kg available</span>
            <span class="pc-price">KES 70<small>/kg</small></span>
          </div>
          <button class="pc-cta" onclick="alert('Purchase Request Submitted!')">Request to Buy</button>
        </div>
      </div>

      <div class="pc-card">
        <div class="pc-img">🧅<span class="pc-tag">Kajiado</span><span class="pc-avail">Active</span></div>
        <div class="pc-body">
          <div class="pc-title">Red Onions</div>
          <div class="pc-farmer">Posted by Ole Kipis Farm</div>
          <div class="pc-bottom">
            <span class="pc-qty">400 kg available</span>
            <span class="pc-price">KES 80<small>/kg</small></span>
          </div>
          <button class="pc-cta" onclick="alert('Purchase Request Submitted!')">Request to Buy</button>
        </div>
      </div>
    </div>
  `,

  'post-produce': `
    <div class="panel-header">
      <h1 class="dash-greeting">Post New Produce Listing</h1>
    </div>

    <div class="dash-panel" style="max-width: 700px; margin: 0 auto; width: 100%;">
      <form id="post-produce-form" onsubmit="handlePostProduce(event)">
        <div class="form-group">
          <label class="form-label">Produce Title</label>
          <input type="text" id="post-title" class="form-input" placeholder="e.g. Sweet Potatoes" required>
        </div>

        <div class="profile-form-grid" style="margin-bottom: 1.5rem;">
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Category</label>
            <select id="post-category" class="form-input" style="height: 50px;">
              <option value="Vegetables">Vegetables</option>
              <option value="Cereals">Cereals</option>
              <option value="Fruits">Fruits</option>
              <option value="Tubers">Tubers</option>
            </select>
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">County Location</label>
            <select id="post-location" class="form-input" style="height: 50px;">
              <option value="Nakuru">Nakuru</option>
              <option value="Uasin Gishu">Uasin Gishu</option>
              <option value="Meru">Meru</option>
              <option value="Kajiado">Kajiado</option>
              <option value="Kiambu">Kiambu</option>
            </select>
          </div>
        </div>

        <div class="profile-form-grid" style="margin-bottom: 1.5rem;">
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Quantity Available (kg)</label>
            <input type="number" id="post-qty" class="form-input" placeholder="e.g. 250" required>
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Price per kg (KES)</label>
            <input type="number" id="post-price" class="form-input" placeholder="e.g. 60" required>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea id="post-desc" class="form-input" rows="4" placeholder="Mention variety, harvest date, packaging details, etc." style="resize: none;"></textarea>
        </div>

        <div class="form-group">
          <label class="form-label">Upload Produce Image</label>
          <input type="file" class="form-input" style="padding: 10px;">
        </div>

        <button type="submit" class="btn btn-fill btn-full" style="background: var(--primary); margin-top: 1rem;">Publish Listing</button>
      </form>
    </div>
  `,

  'find-services': `
    <div class="panel-header" style="margin-bottom: 0;">
      <h1 class="dash-greeting">Find Farm Services</h1>
    </div>

    <!-- Services Filter Bar -->
    <div class="filter-bar">
      <div class="filter-group">
        <label class="filter-label">Service Type:</label>
        <select class="filter-select">
          <option>All Services</option>
          <option>Tractor Plowing</option>
          <option>Transport</option>
          <option>Irrigation</option>
          <option>Machinery Maintenance</option>
        </select>
      </div>
      <div class="filter-group">
        <label class="filter-label">County:</label>
        <select class="filter-select">
          <option>All Counties</option>
          <option>Uasin Gishu</option>
          <option>Nakuru</option>
          <option>Meru</option>
          <option>Kiambu</option>
        </select>
      </div>
    </div>

    <!-- Service Cards Grid -->
    <div class="service-grid">
      <div class="sc">
        <div class="sc-icon"><i data-lucide="tractor"></i></div>
        <h3 class="sc-name">Tractor Plowing</h3>
        <p class="sc-desc">Quick plowing and harrowing services using 90HP John Deere tractors.</p>
        <div class="sc-price" style="font-weight:600; color:var(--primary-dark);">KES 3,500 / acre</div>
        <div class="sc-location">📍 Uasin Gishu, Eldoret</div>
        <div class="sc-status"><span class="status-badge completed">Available</span></div>
        <button class="pc-cta" style="margin-top: 1rem;" onclick="alert('Service Request Submitted!')">Request Service</button>
      </div>

      <div class="sc">
        <div class="sc-icon" style="background:#2563eb;"><i data-lucide="truck"></i></div>
        <h3 class="sc-name">Produce Transport</h3>
        <p class="sc-desc">10-ton refrigerated lorry transport from farm gates to urban markets.</p>
        <div class="sc-price" style="font-weight:600; color:var(--primary-dark);">KES 10,000 / trip</div>
        <div class="sc-location">📍 Rift Valley Region</div>
        <div class="sc-status"><span class="status-badge completed">Available</span></div>
        <button class="pc-cta" style="margin-top: 1rem;" onclick="alert('Service Request Submitted!')">Request Service</button>
      </div>

      <div class="sc">
        <div class="sc-icon" style="background:#d97706;"><i data-lucide="droplet"></i></div>
        <h3 class="sc-name">Drip Irrigation Setup</h3>
        <p class="sc-desc">Design and installation of modern drip irrigation kits for greenhouses.</p>
        <div class="sc-price" style="font-weight:600; color:var(--primary-dark);">KES 5,000 / setup</div>
        <div class="sc-location">📍 Meru and Mt. Kenya</div>
        <div class="sc-status"><span class="status-badge completed">Available</span></div>
        <button class="pc-cta" style="margin-top: 1rem;" onclick="alert('Service Request Submitted!')">Request Service</button>
      </div>
    </div>
  `,

  'my-services': `
    <div class="panel-header" style="margin-bottom: 0;">
      <h1 class="dash-greeting">My Offered Services</h1>
      <button class="btn btn-fill" style="background: var(--primary);" onclick="alert('Post Service Logic')">
        <i data-lucide="plus-circle"></i> Add Service
      </button>
    </div>

    <div class="table-responsive dash-panel">
      <table>
        <thead>
          <tr>
            <th>Icon</th>
            <th>Service Title</th>
            <th>Rate / Pricing</th>
            <th>Operating Counties</th>
            <th>Availability</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><div class="table-item-icon">🚜</div></td>
            <td style="font-weight:600;">Tractor Plowing</td>
            <td>KES 3,500 / acre</td>
            <td>Uasin Gishu, Trans Nzoia</td>
            <td><span class="status-badge completed">Active</span></td>
            <td>
              <button class="btn btn-outline" style="padding: 6px 12px; font-size: 0.8rem; border-radius: 6px;">Edit</button>
              <button class="btn btn-outline" style="padding: 6px 12px; font-size: 0.8rem; border-radius: 6px; color: #dc2626; border-color: #fca5a5;" onclick="this.closest('tr').remove()">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,

  'my-requests': `
    <div class="panel-header" style="margin-bottom: 0;">
      <h1 class="dash-greeting">My Service Requests</h1>
    </div>

    <div class="table-responsive dash-panel">
      <table>
        <thead>
          <tr>
            <th>Service Category</th>
            <th>Service Provider</th>
            <th>Request Date</th>
            <th>Amount / Rate</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="font-weight:600;">Tractor Plowing</td>
            <td>Peter Otieno</td>
            <td>12 May 2025</td>
            <td>KES 3,500/acre</td>
            <td><span class="status-badge completed">Accepted</span></td>
          </tr>
          <tr>
            <td style="font-weight:600;">Transport Service</td>
            <td>Mary Wanjiku</td>
            <td>11 May 2025</td>
            <td>KES 10,000/trip</td>
            <td><span class="status-badge processing">In Progress</span></td>
          </tr>
          <tr>
            <td style="font-weight:600;">Irrigation Setup</td>
            <td>Njagi Irrigation</td>
            <td>10 May 2025</td>
            <td>KES 5,000/kit</td>
            <td><span class="status-badge pending">Pending</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  `,

  'purchase-requests': `
    <div class="panel-header" style="margin-bottom: 0;">
      <h1 class="dash-greeting">Produce Purchase Requests</h1>
    </div>

    <div class="table-responsive dash-panel">
      <table>
        <thead>
          <tr>
            <th>Produce Name</th>
            <th>Buyer / Client</th>
            <th>Quantity Bid</th>
            <th>Offered Price</th>
            <th>Date Requested</th>
            <th>Status</th>
            <th>Decision</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="font-weight:600;">Cherry Tomatoes</td>
            <td>Grace Njeri (Buyer)</td>
            <td>120 kg</td>
            <td>KES 90/kg</td>
            <td>13 May 2025</td>
            <td><span class="status-badge completed">Completed</span></td>
            <td>—</td>
          </tr>
          <tr>
            <td style="font-weight:600;">White Maize</td>
            <td>David Kimani (Mills)</td>
            <td>200 kg</td>
            <td>KES 55/kg</td>
            <td>12 May 2025</td>
            <td><span class="status-badge processing">Pending Review</span></td>
            <td>
              <button class="btn btn-outline" style="padding: 6px 10px; font-size: 0.75rem; border-radius: 6px; color:#16a34a; border-color:#bbf7d0;" onclick="alert('Accepted!')">Accept</button>
              <button class="btn btn-outline" style="padding: 6px 10px; font-size: 0.75rem; border-radius: 6px; color:#dc2626; border-color:#fca5a5;" onclick="alert('Rejected!')">Reject</button>
            </td>
          </tr>
          <tr>
            <td style="font-weight:600;">Irish Potatoes</td>
            <td>Ngong Groceries Ltd</td>
            <td>150 kg</td>
            <td>KES 68/kg</td>
            <td>10 May 2025</td>
            <td><span class="status-badge pending">Awaiting Pay</span></td>
            <td>—</td>
          </tr>
        </tbody>
      </table>
    </div>
  `,

  'service-requests': `
    <div class="panel-header" style="margin-bottom: 0;">
      <h1 class="dash-greeting">Agricultural Service Requests</h1>
    </div>

    <div class="table-responsive dash-panel">
      <table>
        <thead>
          <tr>
            <th>Service Title</th>
            <th>Client Name</th>
            <th>Location</th>
            <th>Booked Date</th>
            <th>Status</th>
            <th>Decision</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="font-weight:600;">Tractor Plowing</td>
            <td>John Mwangi (Farmer)</td>
            <td>Eldoret</td>
            <td>12 May 2025</td>
            <td><span class="status-badge completed">Accepted</span></td>
            <td>—</td>
          </tr>
          <tr>
            <td style="font-weight:600;">Transport Service</td>
            <td>Peter Otieno (Farmer)</td>
            <td>Nakuru</td>
            <td>11 May 2025</td>
            <td><span class="status-badge processing">In Progress</span></td>
            <td>—</td>
          </tr>
          <tr>
            <td style="font-weight:600;">Irrigation Setup</td>
            <td>Grace Njeri (Farmer)</td>
            <td>Kiambu</td>
            <td>10 May 2025</td>
            <td><span class="status-badge pending">Pending</span></td>
            <td>
              <button class="btn btn-outline" style="padding: 6px 10px; font-size: 0.75rem; border-radius: 6px; color:#16a34a; border-color:#bbf7d0;" onclick="alert('Accepted!')">Accept</button>
              <button class="btn btn-outline" style="padding: 6px 10px; font-size: 0.75rem; border-radius: 6px; color:#dc2626; border-color:#fca5a5;" onclick="alert('Rejected!')">Reject</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,

  messages: `
    <div class="panel-header" style="margin-bottom: 0;">
      <h1 class="dash-greeting">Conversations & Messages</h1>
    </div>

    <div class="chat-layout">
      <!-- Threads List -->
      <div class="chat-threads">
        <a href="#" class="chat-thread-item active" onclick="switchChat(event, 'Grace Njeri')">
          <div class="chat-thread-avatar">GN</div>
          <div class="chat-thread-details">
            <div class="chat-thread-name">
              <span>Grace Njeri</span>
              <span class="chat-thread-time">10:42 AM</span>
            </div>
            <div class="chat-thread-preview">Great, I will pick up the maize tomorrow afternoon!</div>
          </div>
        </a>

        <a href="#" class="chat-thread-item" onclick="switchChat(event, 'Peter Otieno')">
          <div class="chat-thread-avatar" style="background:#d97706;">PO</div>
          <div class="chat-thread-details">
            <div class="chat-thread-name">
              <span>Peter Otieno</span>
              <span class="chat-thread-time">Yesterday</span>
            </div>
            <div class="chat-thread-preview">Hi, is the plowing service still available on Thursday?</div>
          </div>
        </a>

        <a href="#" class="chat-thread-item" onclick="switchChat(event, 'Mary Wanjiku')">
          <div class="chat-thread-avatar" style="background:#2563eb;">MW</div>
          <div class="chat-thread-details">
            <div class="chat-thread-name">
              <span>Mary Wanjiku</span>
              <span class="chat-thread-time">9 May 2025</span>
            </div>
            <div class="chat-thread-preview">Thank you for the quick payment. Lorry is loaded.</div>
          </div>
        </a>
      </div>

      <!-- Chat Box -->
      <div class="chat-box">
        <div class="chat-header">
          <div class="chat-thread-avatar" id="active-chat-avatar">GN</div>
          <div>
            <div class="chat-header-name" id="active-chat-name">Grace Njeri</div>
            <div class="chat-header-status">Online</div>
          </div>
        </div>

        <div class="chat-messages" id="chat-bubble-log">
          <div class="chat-msg-bubble incoming">
            Hello John, I saw your white maize listing in Nakuru. Is it still available?
            <div class="chat-msg-time">10:30 AM</div>
          </div>
          <div class="chat-msg-bubble outgoing">
            Yes Grace! It is dry and ready. 500 kg available.
            <div class="chat-msg-time">10:35 AM</div>
          </div>
          <div class="chat-msg-bubble incoming">
            Great, I will pick up the maize tomorrow afternoon! Let's arrange M-Pesa.
            <div class="chat-msg-time">10:42 AM</div>
          </div>
        </div>

        <div class="chat-input-area">
          <input type="text" id="chat-input-msg" class="chat-input-field" placeholder="Type your message here..." onkeydown="if(event.key==='Enter')sendChatMessage()">
          <button class="chat-send-btn" onclick="sendChatMessage()">Send</button>
        </div>
      </div>
    </div>
  `,

  notifications: `
    <div class="panel-header" style="margin-bottom: 0;">
      <h1 class="dash-greeting">Notifications Centre</h1>
    </div>

    <div class="notif-list">
      <div class="notif-card">
        <div class="notif-icon-circle green">
          <i data-lucide="shopping-bag"></i>
        </div>
        <div class="notif-content">
          <div class="notif-msg"><strong>Grace Njeri (Buyer)</strong> accepted your price offer and completed the payment for <strong>Cherry Tomatoes (120 kg)</strong>.</div>
          <div class="notif-time">2 hours ago</div>
        </div>
      </div>

      <div class="notif-card">
        <div class="notif-icon-circle blue">
          <i data-lucide="wrench"></i>
        </div>
        <div class="notif-content">
          <div class="notif-msg">Your agricultural request for <strong>Tractor Plowing</strong> has been marked as <strong>Accepted</strong> by provider <strong>Peter Otieno</strong>.</div>
          <div class="notif-time">Yesterday</div>
        </div>
      </div>

      <div class="notif-card">
        <div class="notif-icon-circle yellow">
          <i data-lucide="sparkles"></i>
        </div>
        <div class="notif-content">
          <div class="notif-msg"><strong>System Tip:</strong> Listings containing high quality images are up to <strong>3x more likely</strong> to receive purchase offers from premium buyers.</div>
          <div class="notif-time">3 days ago</div>
        </div>
      </div>
    </div>
  `,

  reviews: `
    <div class="panel-header" style="margin-bottom: 0;">
      <h1 class="dash-greeting">Ratings & Customer Reviews</h1>
    </div>

    <!-- Ratings Metric Card -->
    <div class="dash-stats-row" style="margin-bottom: 0;">
      <div class="stat-card-new" style="grid-column: span 2;">
        <div class="stat-icon-wrapper yellow">
          <i data-lucide="star"></i>
        </div>
        <div class="stat-details">
          <div class="stat-number">4.8 / 5.0</div>
          <div class="stat-title">Average Seller Rating</div>
          <div class="stat-trend up">Based on 14 transactions</div>
        </div>
      </div>
      <div class="stat-card-new">
        <div class="stat-icon-wrapper green">
          <i data-lucide="thumbs-up"></i>
        </div>
        <div class="stat-details">
          <div class="stat-number">100%</div>
          <div class="stat-title">Positive Feedback</div>
        </div>
      </div>
      <div class="stat-card-new">
        <div class="stat-icon-wrapper blue">
          <i data-lucide="message-square"></i>
        </div>
        <div class="stat-details">
          <div class="stat-number">5</div>
          <div class="stat-title">Written Reviews</div>
        </div>
      </div>
    </div>

    <!-- Reviews Feed -->
    <div class="dash-panel">
      <h3 class="panel-title" style="margin-bottom: 1.5rem;">User Feedback</h3>
      <div class="todo-list-wrapper">
        <div class="todo-item" style="flex-direction: column; gap: 6px;">
          <div class="flex-between" style="width: 100%;">
            <span style="font-weight: 600; font-size: 0.9rem;">Grace Njeri</span>
            <span style="color: #f59e0b; font-size: 0.8rem;">★★★★★ (5/5)</span>
          </div>
          <div class="todo-desc" style="font-size: 0.85rem; color: var(--text);">Excellent fresh tomatoes! Perfectly packed and ready on time. Looking forward to buying again.</div>
          <textarea class="form-input" rows="2" placeholder="Respond to this review..." style="margin-top: 10px; font-size: 0.8rem; resize: none;"></textarea>
          <button class="btn btn-fill" style="padding: 6px 12px; font-size: 0.8rem; align-self: flex-end; margin-top: 5px; background: var(--primary);" onclick="alert('Response saved!')">Submit Response</button>
        </div>

        <div class="todo-item" style="flex-direction: column; gap: 6px;">
          <div class="flex-between" style="width: 100%;">
            <span style="font-weight: 600; font-size: 0.9rem;">David Kimani</span>
            <span style="color: #f59e0b; font-size: 0.8rem;">★★★★☆ (4/5)</span>
          </div>
          <div class="todo-desc" style="font-size: 0.85rem; color: var(--text);">Maize moisture content was perfect. Smooth transaction at Nakuru.</div>
        </div>
      </div>
    </div>
  `,

  analytics: `
    <div class="panel-header" style="margin-bottom: 0;">
      <h1 class="dash-greeting">Performance Analytics</h1>
    </div>

    <!-- Analytics Sub-grid -->
    <div class="dash-layout-grid">
      <!-- Monthly Growth Line Chart -->
      <div class="dash-panel">
        <div class="panel-header">
          <h3 class="panel-title">Transaction & Listing Activity</h3>
        </div>
        <div class="chart-container" style="height: 300px;">
          <canvas id="analyticsBarChart"></canvas>
        </div>
      </div>

      <!-- Doughnut / Pie category chart -->
      <div class="dash-panel">
        <div class="panel-header">
          <h3 class="panel-title">Demand Share</h3>
        </div>
        <div class="chart-container" style="height: 300px;">
          <canvas id="analyticsPieChart"></canvas>
        </div>
      </div>
    </div>

    <!-- Additional metrics -->
    <div class="dash-panel">
      <h3 class="panel-title" style="margin-bottom: 1rem;">Platform Growth & Insights</h3>
      <p class="todo-desc" style="font-size: 0.85rem; line-height: 1.6;">
        Your listings in <strong>Nakuru County</strong> received the highest click-through rate this month. Farmers listing <strong>Maize</strong> and <strong>Tomatoes</strong> are seeing a <strong>24% month-over-month increase</strong> in completed direct purchases.
      </p>
    </div>
  `,

  profile: `
    <div class="panel-header">
      <h1 class="dash-greeting">My Profile</h1>
    </div>

    <div class="dash-panel" style="max-width: 800px; margin: 0 auto; width: 100%;">
      <div class="profile-header-section">
        <div class="profile-avatar-large" id="profile-avatar-large">?</div>
        <div class="profile-title-info">
          <h2 id="profile-display-name">John Kamau</h2>
          <p><span class="status-badge completed" style="padding: 2px 8px;"><i data-lucide="check-circle" style="width:10px; height:10px; vertical-align:middle;"></i> Verified Farmer</span></p>
        </div>
      </div>

      <!-- Success Banner -->
      <div id="profile-success-banner" class="auth-banner success" style="display:none; width: 100%;">
        Profile updated successfully!
      </div>

      <form id="profile-edit-form" onsubmit="handleProfileUpdate(event)">
        <div class="profile-form-grid">
          <div class="form-group">
            <label class="form-label">Full Name</label>
            <input type="text" id="profile-fullname" class="form-input" value="John Kamau" required>
          </div>
          <div class="form-group">
            <label class="form-label">Phone Number</label>
            <input type="tel" id="profile-phone" class="form-input" value="0712345678" required>
          </div>
        </div>

        <div class="profile-form-grid">
          <div class="form-group">
            <label class="form-label">Email Address</label>
            <input type="email" id="profile-email" class="form-input" value="john@example.com">
          </div>
          <div class="form-group">
            <label class="form-label">County Location</label>
            <select id="profile-county" class="form-input" style="height: 50px;">
              <option value="Uasin Gishu, Eldoret">Uasin Gishu, Eldoret</option>
              <option value="Nakuru">Nakuru</option>
              <option value="Meru">Meru</option>
              <option value="Kajiado">Kajiado</option>
              <option value="Kiambu">Kiambu</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Profile Image URL</label>
          <input type="text" id="profile-avatar-url" class="form-input" placeholder="Paste image link or leave blank for initials">
        </div>

        <button type="submit" class="btn btn-fill" style="background: var(--primary); margin-top: 1rem; align-self: flex-start;">Save Profile Changes</button>
      </form>
    </div>
  `,

  settings: `
    <div class="panel-header">
      <h1 class="dash-greeting">Settings & Security</h1>
    </div>

    <div class="dash-panel" style="max-width: 800px; margin: 0 auto; width: 100%;">
      <!-- Change Password Section -->
      <h3 class="panel-title" style="border-bottom:1px solid var(--stone); padding-bottom:10px; margin-bottom:1.5rem;">Update Security Password</h3>
      <form onsubmit="event.preventDefault(); alert('Password successfully updated!')">
        <div class="profile-form-grid">
          <div class="form-group">
            <label class="form-label">Current Password</label>
            <input type="password" class="form-input" required placeholder="••••••••">
          </div>
          <div class="form-group">
            <label class="form-label">New Password</label>
            <input type="password" class="form-input" required placeholder="Min 6 characters">
          </div>
        </div>
        <button type="submit" class="btn btn-fill" style="background: var(--primary);">Change Password</button>
      </form>

      <!-- Preferences Notifications -->
      <h3 class="panel-title" style="border-bottom:1px solid var(--stone); padding-bottom:10px; margin-top:3rem; margin-bottom:1.5rem;">Notification Configurations</h3>
      <div class="todo-list-wrapper">
        <label class="todo-item" style="cursor:pointer; display:flex; align-items:center;">
          <input type="checkbox" checked style="width: 18px; height: 18px; cursor:pointer;">
          <div class="todo-details" style="margin-left: 10px;">
            <div class="todo-title">SMS Notifications</div>
            <div class="todo-desc">Receive real-time bid updates via SMS directly to your phone.</div>
          </div>
        </label>

        <label class="todo-item" style="cursor:pointer; display:flex; align-items:center;">
          <input type="checkbox" checked style="width: 18px; height: 18px; cursor:pointer;">
          <div class="todo-details" style="margin-left: 10px;">
            <div class="todo-title">Email Receipts & Alerts</div>
            <div class="todo-desc">Receive weekly market price summaries and transaction logs.</div>
          </div>
        </label>
      </div>
    </div>
  `,

  support: `
    <div class="panel-header">
      <h1 class="dash-greeting">Help & Platform Support</h1>
    </div>

    <div class="dash-layout-grid">
      <!-- FAQ Section -->
      <div class="dash-panel">
        <h3 class="panel-title" style="margin-bottom:1.5rem;">Frequently Asked Questions</h3>
        <div class="faq-wrapper">
          <div class="faq-item" onclick="this.classList.toggle('active')">
            <div class="faq-question">
              <span>How do I request to buy produce?</span>
              <i data-lucide="chevron-down"></i>
            </div>
            <div class="faq-answer">
              Navigate to Marketplace → Browse Produce. Click "Request to Buy" on any crop. The farmer will receive your offer instantly and contact you to complete the trade.
            </div>
          </div>

          <div class="faq-item" onclick="this.classList.toggle('active')">
            <div class="faq-question">
              <span>Are agricultural service providers verified?</span>
              <i data-lucide="chevron-down"></i>
            </div>
            <div class="faq-answer">
              Yes. AgriConnect KE checks service provider certifications, physical location, and credentials before their services are listed in the catalog.
            </div>
          </div>

          <div class="faq-item" onclick="this.classList.toggle('active')">
            <div class="faq-question">
              <span>How are payments processed?</span>
              <i data-lucide="chevron-down"></i>
            </div>
            <div class="faq-answer">
              Currently, buyers and sellers connect directly and transact using M-Pesa or bank transfer. Integrated secure wallet payments are planned for subsequent milestones.
            </div>
          </div>
        </div>
      </div>

      </div>
    </div>
  `,

  assistant: `
    <div class="panel-header" style="margin-bottom: 0;">
      <h1 class="dash-greeting">AI Farm Assistant</h1>
      <span class="status-badge processing" id="rag-badge" style="font-weight:600;"><i data-lucide="cpu" style="width:12px; height:12px; vertical-align:middle; margin-right:4px;"></i> RAG Context Retrieval Enabled</span>
    </div>

    <!-- Main split layout: config and chat -->
    <div class="dash-layout-grid" style="grid-template-columns: 1fr 2fr;">
      
      <!-- Left: API key and settings -->
      <div class="dash-left-column" style="gap: 1.5rem;">
        <div class="dash-panel">
          <h3 class="panel-title" style="margin-bottom: 1rem;"><i data-lucide="key" style="vertical-align:middle; width:16px; height:16px; margin-right:6px;"></i> Gemini Configuration</h3>
          <div id="api-key-status" class="auth-banner" style="padding: 10px; font-size: 0.8rem; border-radius: 8px; margin-bottom: 1rem; text-align: center;">
            Checking API Key status...
          </div>
          
          <form id="save-key-form" onsubmit="saveApiKey(event)">
            <div class="form-group">
              <label class="form-label" style="font-size: 0.8rem;">Gemini API Key</label>
              <input type="password" id="gemini-key-input" class="form-input" placeholder="Paste your API key here..." required style="height: 42px; font-size: 0.85rem;">
            </div>
            
            <div class="form-group" style="margin-top: 10px;">
              <label class="form-label" style="font-size: 0.8rem;">Select Model</label>
              <select id="gemini-model-select" class="form-input" style="height: 42px; font-size: 0.85rem; padding: 0 10px; background: var(--white); cursor: pointer;">
                <option value="gemini-2.0-flash">Gemini 2.0 Flash (Recommended)</option>
                <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
              </select>
            </div>

            <div style="display:flex; gap:10px; margin-top:15px;">
              <button type="submit" class="btn btn-fill" style="background:var(--primary); font-size:0.8rem; padding:8px 12px; flex:1;">Save Key</button>
              <button type="button" class="btn btn-outline" style="font-size:0.8rem; padding:8px 12px; border-color:#ef4444; color:#ef4444;" onclick="clearApiKey()">Clear Key</button>
            </div>
          </form>
        </div>

        <div class="dash-panel">
          <h3 class="panel-title" style="margin-bottom: 1rem;"><i data-lucide="database" style="vertical-align:middle; width:16px; height:16px; margin-right:6px;"></i> Knowledge Base (RAG)</h3>
          <p class="todo-desc" style="font-size: 0.75rem; line-height: 1.5; margin-bottom: 10px;">
            The assistant searches these verified local databases to expand prompts:
          </p>
          <ul style="padding-left:16px; font-size:0.75rem; color:var(--text-light); line-height:1.8;">
            <li><strong>Maize Guide</strong> (spacing, armyworm)</li>
            <li><strong>Tomato Blight</strong> (treatment, staking)</li>
            <li><strong>Potato Scab</strong> (seed selection, hilling)</li>
            <li><strong>Onion Curing</strong> (pH levels, drying)</li>
            <li><strong>Soil Enrichment</strong> (lime, compost)</li>
          </ul>
        </div>
      </div>

      <!-- Right: Chat Interface -->
      <div class="dash-right-column" style="gap: 1.5rem;">
        <div class="chat-box" style="border: 1px solid var(--stone); border-radius: var(--radius-lg); overflow: hidden; height: 500px; display: flex; flex-direction: column;">
          <div class="chat-header" style="background:var(--white); border-bottom: 1px solid var(--stone); display:flex; align-items:center; gap:12px;">
            <div class="chat-thread-avatar" style="background:var(--primary);"><i data-lucide="bot" style="width:20px; height:20px; color:var(--white);"></i></div>
            <div>
              <div class="chat-header-name">AgriConnect Assistant</div>
              <div class="chat-header-status" id="bot-status" style="font-size:0.75rem; color:var(--text-light);">Ready to help</div>
            </div>
          </div>

          <div class="chat-messages" id="bot-chat-log" style="flex:1; background:var(--cream); padding:1.5rem; overflow-y:auto; display:flex; flex-direction:column; gap:1rem;">
            <div class="chat-msg-bubble incoming">
              Jambo! I am your AgriConnect Farm Assistant. 
              <br><br>
              I can help diagnose crop problems, suggest spacing guidelines, fertilizing schedules, and more. 
              Ask me anything about Kenyan agriculture!
              <div class="chat-msg-time">Assistant</div>
            </div>
          </div>

          <!-- RAG Context Info Display Area -->
          <div id="rag-retrieved-context" style="background:#f1f5f9; border-top:1px solid var(--stone); font-size:0.7rem; color:#475569; padding:6px 12px; font-family:monospace; display:none; max-height: 80px; overflow-y: auto;">
            <strong>[RAG Match]:</strong> None.
          </div>

          <div class="chat-input-area" style="background:var(--white); border-top:1px solid var(--stone); display:flex; gap:10px; padding:12px;">
            <input type="text" id="bot-input-msg" class="chat-input-field" placeholder="Ask a crop question..." onkeydown="if(event.key==='Enter')sendBotMessage()" style="flex:1; padding:10px 14px; border:1px solid var(--stone); border-radius:8px; font-size:0.85rem;">
            <button class="chat-send-btn" onclick="sendBotMessage()" style="background:var(--primary); color:var(--white); border:none; border-radius:8px; padding:10px 16px; font-weight:600; cursor:pointer;">Send</button>
          </div>
        </div>
      </div>
    </div>
  `
};
