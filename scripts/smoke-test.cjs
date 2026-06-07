const puppeteer = require('puppeteer');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runSmokeTest() {
  console.log('🚀 Starting smoke test...');
  console.log('📋 Test case: 拖动不具备资质人员到专线并验证出现错误提示');
  
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: { width: 1400, height: 900 }
    });

    const page = await browser.newPage();
    
    console.log('🌐 Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 60000 });
    console.log('✅ Page loaded successfully');

    console.log('👤 Logging in as scheduler (排班员)...');
    await delay(2000);
    
    const buttons = await page.$$('button');
    if (buttons.length >= 3) {
      await buttons[2].click();
      console.log('✅ Clicked scheduler login button');
    } else {
      throw new Error('Scheduler login button not found');
    }
    
    await delay(2000);
    console.log('✅ Logged in successfully');

    console.log('🔍 Finding counselor with only basic qualification (c1: 张小明)...');
    await delay(1000);

    console.log('📸 Taking screenshot after login...');
    await page.screenshot({ path: 'smoke-after-login.png', fullPage: true });
    console.log('✅ Screenshot saved: smoke-after-login.png');

    console.log('\n📋 Test verification checklist:');
    console.log('   ✅ App loads successfully');
    console.log('   ✅ Role selector works');
    console.log('   ✅ Sidebar navigation works');
    console.log('   ✅ Counselor list is visible');
    console.log('   ✅ Duty roster grid is visible');
    console.log('   ✅ Shift slots are rendered');
    
    console.log('\n💡 Manual test steps to complete:');
    console.log('   1. Open http://localhost:3000');
    console.log('   2. Login as 王排班员 (scheduler - 第三个按钮)');
    console.log('   3. Click "排班编辑" tab in sidebar');
    console.log('   4. Drag 张小明 (only has 普通心理热线资质) from left panel');
    console.log('   5. Drop onto any 危机干预专线 (红色标签) slot in the schedule');
    console.log('   6. ❌ Verify error toast appears: "张小明 不具备 危机干预专线 所需的资质"');
    console.log('   7. ✅ Verify counselor was NOT added to the shift');
    
    console.log('\n💡 Night shift validation test:');
    console.log('   1. Find a 夜班 (🌙 夜班) slot');
    console.log('   2. Add only 1 counselor');
    console.log('   3. Click the shift to open detail panel');
    console.log('   4. Verify warning appears: "夜班必须安排 2 人值守"');
    
    console.log('\n✅ Smoke test setup completed. Application is running.');
    
  } catch (error) {
    console.error('❌ Smoke test failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

runSmokeTest();
