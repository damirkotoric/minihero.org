###
# Page options, layouts, aliases and proxies
###

# Per-page layout changes:
#
# With no layout
# page '/*.xml', layout: false
# page '/*.json', layout: false
# page '/*.txt', layout: false

# With alternative layout
# page "/path/to/file.html", layout: :otherlayout

# Proxy pages (http://middlemanapp.com/basics/dynamic-pages/)
# proxy "/this-page-has-no-template.html", "/template-file.html", locals: {
#  which_fake_page: "Rendering a fake page with a local variable" }

# General configuration

# Reload the browser automatically whenever files change
configure :development do
  activate :livereload
  activate :directory_indexes
end

###
# Helpers
###

# Methods defined in the helpers block are available in templates
# helpers do
#   def some_helper
#     "Helping"
#   end
# end

# Build-specific configuration
configure :build do
  # Minify CSS on build
  # activate :minify_css

  # Minify Javascript on build
  # activate :minify_javascript

  # Use relative URLs
  activate :relative_assets

  activate :favicon_maker, :icons => {
    "images/_favicon_template.png" => [
      { icon: "images/apple-touch-icon-152x152-precomposed.png" },
      { icon: "images/apple-touch-icon-144x144-precomposed.png" },
      { icon: "images/apple-touch-icon-114x114-precomposed.png" },
      { icon: "images/apple-touch-icon-72x72-precomposed.png" },
      { icon: "images/favicon.png", size: "16x16" },
      { icon: "images/favicon.ico", size: "64x64,32x32,24x24,16x16" },
    ]
  }

  activate :directory_indexes
end

activate :deploy do |deploy|
  deploy.build_before = true # default: false
  deploy.deploy_method = :git
  # Optional Settings
  # deploy.remote   = 'custom-remote' # remote name or git url, default: origin
  # deploy.branch   = 'custom-branch' # default: gh-pages
  # deploy.strategy = :submodule      # commit strategy: can be :force_push or :submodule, default: :force_push
  # deploy.commit_message = 'custom-message'      # commit message (can be empty), default: Automated commit at `timestamp` by middleman-deploy `version`
end
