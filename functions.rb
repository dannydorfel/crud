require 'sass'
require 'base64'

module Sass::Script::Functions
    def base64Encode(string)
        assert_type string, :String
        Sass::Script::String.new(Base64.encode64(string.value))
    end

    # Does the supplied image exist?
    def file_exists(image_file)
        path = image_file.value
        Sass::Script::Bool.new(File.exists?(path))
    end
end