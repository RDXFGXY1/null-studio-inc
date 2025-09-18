// Mobile Navigation Toggle
document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.querySelector(".hamburger")
  const navMenu = document.querySelector(".nav-menu")

  if (hamburger && navMenu) {
    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("active")
      navMenu.classList.toggle("active")
    })

    // Close menu when clicking on a link
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", () => {
        hamburger.classList.remove("active")
        navMenu.classList.remove("active")
      })
    })
  }

  // Initialize all functionality
  initializeScrollEffects()
  initializeInteractiveElements()
  initializeCounterAnimations()
  initializeDonationModal()
})

// Smooth scrolling functions
function scrollToFeatures() {
  document.getElementById("features").scrollIntoView({
    behavior: "smooth",
    block: "start",
  })
}

function scrollToUpgrade() {
  document.getElementById("upgrade").scrollIntoView({
    behavior: "smooth",
    block: "start",
  })
}

// Smooth scrolling for all anchor links
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault()
      const target = document.querySelector(this.getAttribute("href"))
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }
    })
  })
})

// Scroll effects and animations
function initializeScrollEffects() {
  // Navbar background effect
  window.addEventListener("scroll", () => {
    const navbar = document.querySelector(".navbar")
    if (window.scrollY > 100) {
      navbar.style.background = "rgba(15, 23, 42, 0.98)"
      navbar.style.borderBottomColor = "rgba(22, 78, 99, 0.5)"
    } else {
      navbar.style.background = "rgba(15, 23, 42, 0.95)"
      navbar.style.borderBottomColor = "rgba(22, 78, 99, 0.3)"
    }
  })

  // Intersection Observer for fade-in animations
  const observerOptions = {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px",
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("fade-in")

        // Trigger counter animation for stat numbers
        if (entry.target.classList.contains("stat-item")) {
          animateCounter(entry.target)
        }

        // Trigger metric animation
        if (entry.target.classList.contains("metric-card")) {
          animateMetric(entry.target)
        }
      }
    })
  }, observerOptions)

  // Observe elements for animation
  document
    .querySelectorAll(
      ".overview-card, .feature-card, .flow-step, .metric-card, .comparison-card, .stat-item, .benefit-item",
    )
    .forEach((el) => {
      observer.observe(el)
    })
}

// Counter animation for statistics
function animateCounter(element) {
  const numberElement = element.querySelector(".stat-number")
  if (!numberElement || numberElement.classList.contains("animated")) return

  numberElement.classList.add("animated")
  const finalText = numberElement.textContent
  const isNumeric = /^[\d.]+/.test(finalText)

  if (isNumeric) {
    const finalNumber = Number.parseFloat(finalText)
    const duration = 2000
    const startTime = Date.now()
    const suffix = finalText.replace(/^[\d.]+/, "")

    const updateNumber = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const currentNumber = finalNumber * easeOutQuart

      if (progress < 1) {
        if (Number.isInteger(finalNumber)) {
          numberElement.textContent = Math.floor(currentNumber) + suffix
        } else {
          numberElement.textContent = currentNumber.toFixed(1) + suffix
        }
        requestAnimationFrame(updateNumber)
      } else {
        numberElement.textContent = finalText
      }
    }

    numberElement.textContent = "0" + suffix
    requestAnimationFrame(updateNumber)
  }
}

// Metric animation
function animateMetric(element) {
  const valueElement = element.querySelector(".metric-value")
  if (!valueElement || valueElement.classList.contains("animated")) return

  valueElement.classList.add("animated")

  // Create subtle glow effect
  valueElement.style.textShadow = "0 0 10px rgba(22, 78, 99, 0.5)"

  setTimeout(() => {
    valueElement.style.textShadow = ""
  }, 1000)
}

// Interactive elements initialization
function initializeInteractiveElements() {
  // Button ripple effects
  document.querySelectorAll(".btn").forEach((button) => {
    button.addEventListener("click", function (e) {
      if (this.tagName === "A" && this.getAttribute("href") && this.getAttribute("href").startsWith("#")) {
        return
      }

      createRipple(e, this)
    })
  })

  // Card hover effects
  document.querySelectorAll(".overview-card, .feature-card, .comparison-card").forEach((card) => {
    card.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-8px)"
      this.style.boxShadow = "0 25px 50px rgba(0, 0, 0, 0.15)"
    })

    card.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0)"
      this.style.boxShadow = ""
    })
  })

  // Upgrade card special effects
  const upgradeCard = document.querySelector(".upgrade-card")
  if (upgradeCard) {
    upgradeCard.addEventListener("mouseenter", function () {
      this.style.borderColor = "rgba(22, 78, 99, 0.8)"
      this.style.boxShadow = "0 0 30px rgba(22, 78, 99, 0.2)"
    })

    upgradeCard.addEventListener("mouseleave", function () {
      this.style.borderColor = "var(--color-primary)"
      this.style.boxShadow = ""
    })
  }
}

// Create ripple effect for buttons
function createRipple(event, element) {
  const ripple = document.createElement("span")
  ripple.classList.add("ripple")
  element.appendChild(ripple)

  const rect = element.getBoundingClientRect()
  const size = Math.max(rect.width, rect.height)
  const x = event.clientX - rect.left - size / 2
  const y = event.clientY - rect.top - size / 2

  ripple.style.width = ripple.style.height = size + "px"
  ripple.style.left = x + "px"
  ripple.style.top = y + "px"

  setTimeout(() => {
    ripple.remove()
  }, 600)
}

// Counter animations for stats
function initializeCounterAnimations() {
  const stats = document.querySelectorAll(".stat-number, .metric-value")
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !entry.target.classList.contains("counted")) {
        entry.target.classList.add("counted")
        animateValue(entry.target)
      }
    })
  })

  stats.forEach((stat) => observer.observe(stat))
}

function animateValue(element) {
  const text = element.textContent
  const hasNumber = /\d/.test(text)

  if (hasNumber) {
    const number = Number.parseFloat(text)
    if (!isNaN(number)) {
      const suffix = text.replace(/[\d.]/g, "")
      const startValue = 0
      const duration = 2000
      const startTime = performance.now()

      const animate = (currentTime) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)
        const easeOut = 1 - Math.pow(1 - progress, 3)
        const currentValue = startValue + (number - startValue) * easeOut

        if (Number.isInteger(number)) {
          element.textContent = Math.floor(currentValue) + suffix
        } else {
          element.textContent = currentValue.toFixed(1) + suffix
        }

        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }

      requestAnimationFrame(animate)
    }
  }
}

// Donation Modal functionality
function initializeDonationModal() {
  const modal = document.getElementById("donationModal")
  const openButtons = document.querySelectorAll("#navDonateBtn, #heroSupportBtn, #mainSupportBtn")
  const closeButton = document.getElementById("modalClose")
  const overlay = document.querySelector(".modal-overlay")
  const amountButtons = document.querySelectorAll(".amount-btn")
  const customAmountInput = document.getElementById("customAmount")

  let selectedAmount = 10 // Default amount

  // Open modal
  openButtons.forEach((button) => {
    button.addEventListener("click", () => {
      modal.classList.add("active")
      document.body.style.overflow = "hidden"
      initializePayPal()
    })
  })

  // Close modal
  function closeModal() {
    modal.classList.remove("active")
    document.body.style.overflow = ""
  }

  closeButton.addEventListener("click", closeModal)
  overlay.addEventListener("click", closeModal)

  // Amount selection
  amountButtons.forEach((button) => {
    button.addEventListener("click", function () {
      amountButtons.forEach((btn) => btn.classList.remove("selected"))
      this.classList.add("selected")
      selectedAmount = Number.parseInt(this.dataset.amount)
      customAmountInput.value = ""
      updatePayPalButton()
    })
  })

  // Custom amount input
  customAmountInput.addEventListener("input", function () {
    amountButtons.forEach((btn) => btn.classList.remove("selected"))
    selectedAmount = Number.parseFloat(this.value) || 10
    updatePayPalButton()
  })

  // Initialize PayPal
  function initializePayPal() {
    const paypal = window.paypal // Declare the paypal variable
    if (paypal && document.getElementById("paypal-button-container")) {
      paypal
        .Buttons({
          createOrder: (data, actions) =>
            actions.order.create({
              purchase_units: [
                {
                  amount: {
                    value: selectedAmount.toString(),
                  },
                  description: "Support NullTracker Development",
                },
              ],
            }),
          onApprove: (data, actions) =>
            actions.order.capture().then((details) => {
              showSuccessMessage(
                "Thank you for your support! Your contribution helps us continue developing NullTracker.",
              )
              closeModal()
            }),
          onError: (err) => {
            console.error("PayPal error:", err)
            showErrorMessage("Payment failed. Please try again or use an alternative payment method.")
          },
        })
        .render("#paypal-button-container")
    }
  }

  function updatePayPalButton() {
    const container = document.getElementById("paypal-button-container")
    if (container) {
      container.innerHTML = ""
      initializePayPal()
    }
  }

  // Set default selected amount
  if (amountButtons.length > 1) {
    amountButtons[1].classList.add("selected") // Select $10 by default
  }
}

// Utility functions
function showSuccessMessage(message) {
  const notification = createNotification(message, "success")
  document.body.appendChild(notification)

  setTimeout(() => {
    notification.remove()
  }, 5000)
}

function showErrorMessage(message) {
  const notification = createNotification(message, "error")
  document.body.appendChild(notification)

  setTimeout(() => {
    notification.remove()
  }, 5000)
}

function createNotification(message, type) {
  const notification = document.createElement("div")
  notification.style.cssText = `
        position: fixed;
        top: 2rem;
        right: 2rem;
        background: ${type === "success" ? "var(--color-primary)" : "var(--color-destructive)"};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        z-index: 10001;
        max-width: 400px;
        font-weight: 500;
        animation: slideInRight 0.3s ease;
    `
  notification.textContent = message

  return notification
}

// Upgrade button functionality
document.addEventListener("DOMContentLoaded", () => {
  const upgradeBtn = document.querySelector(".upgrade-btn")
  if (upgradeBtn) {
    upgradeBtn.addEventListener("click", function () {
      const originalText = this.innerHTML
      this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...'
      this.disabled = true

      setTimeout(() => {
        this.innerHTML = '<i class="fas fa-check"></i> Redirecting to Premium...'

        setTimeout(() => {
          console.log("Redirecting to premium upgrade...")
          this.innerHTML = originalText
          this.disabled = false
        }, 1500)
      }, 2000)
    })
  }
})

// Discord button functionality
document.addEventListener("DOMContentLoaded", () => {
  const discordBtns = document.querySelectorAll(".btn:has(.fa-discord)")
  discordBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const originalText = this.innerHTML
      this.innerHTML = '<i class="fas fa-check"></i> Opening Discord...'

      setTimeout(() => {
        console.log("Opening Discord invite...")
        this.innerHTML = originalText
      }, 2000)
    })
  })
})

// Scroll progress indicator
document.addEventListener("DOMContentLoaded", () => {
  const progressBar = document.createElement("div")
  progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 3px;
        background: linear-gradient(90deg, var(--color-primary), var(--color-accent));
        z-index: 10000;
        transition: width 0.3s ease;
        box-shadow: 0 0 10px rgba(22, 78, 99, 0.3);
    `
  document.body.appendChild(progressBar)

  window.addEventListener("scroll", () => {
    const scrollTop = window.pageYOffset
    const docHeight = document.documentElement.scrollHeight - window.innerHeight
    const scrollPercent = (scrollTop / docHeight) * 100
    progressBar.style.width = scrollPercent + "%"
  })
})

// Add CSS animations
const animationStyles = document.createElement("style")
animationStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`
document.head.appendChild(animationStyles)
