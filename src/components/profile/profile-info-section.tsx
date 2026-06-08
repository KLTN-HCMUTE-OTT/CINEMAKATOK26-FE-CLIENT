"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Save, X, User, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useProfileQuery,
  useUpdateProfileMutation,
  useUpdateAvatarMutation,
} from "@/hooks/use-profile";
import { useCloudinary } from "@/hooks/use-cloudinary";
import { Progress } from "@/components/ui/progress";

export function ProfileInfoSection() {
  const profileQuery = useProfileQuery();
  const updateProfileMutation = useUpdateProfileMutation();
  const updateAvatarMutation = useUpdateAvatarMutation();
  const { uploadImage, isUploading, uploadProgress } = useCloudinary();

  const [isEditing, setIsEditing] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    gender: "OTHER" as "MALE" | "FEMALE" | "OTHER",
    dateOfBirth: "",
    address: "",
    phoneNumber: "",
    avatar: "",
  });

  const [avatarPreview, setAvatarPreview] = useState("");

  // Populate form when profile data is available
  useEffect(() => {
    const profile = profileQuery.data;
    if (!profile) return;

    const avatarUrl = profile.avatar || "";
    let dateOfBirth = "";
    if (typeof profile.dateOfBirth === "string" && profile.dateOfBirth) {
      try {
        const date = new Date(profile.dateOfBirth);
        if (!isNaN(date.getTime())) {
          dateOfBirth = date.toISOString().split("T")[0];
        }
      } catch (e) {
        console.error("Invalid date format:", profile.dateOfBirth);
      }
    }

    setFormData({
      name: profile.name || "",
      email: profile.email || "",
      gender: profile.gender || "OTHER",
      dateOfBirth,
      address: typeof profile.address === "string" ? profile.address : "",
      phoneNumber:
        typeof profile.phoneNumber === "string" ? profile.phoneNumber : "",
      avatar: avatarUrl,
    });
    setAvatarPreview(avatarUrl);
  }, [profileQuery.data]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }

      // Save file for upload
      setAvatarFile(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      // Validate required fields
      if (!formData.name || formData.name.trim() === "") {
        toast.error("Name is required");
        return;
      }

      // Validate name length
      const trimmedName = formData.name.trim();
      if (trimmedName.length < 2) {
        toast.error("Name must be at least 2 characters");
        return;
      }

      if (trimmedName.length > 100) {
        toast.error("Name must be less than 100 characters");
        return;
      }

      // Validate date of birth (required)
      if (!formData.dateOfBirth || formData.dateOfBirth.trim() === "") {
        toast.error("Date of birth is required");
        return;
      }

      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();

      if (isNaN(birthDate.getTime())) {
        toast.error("Invalid date of birth");
        return;
      }

      if (birthDate > today) {
        toast.error("Date of birth cannot be in the future");
        return;
      }

      if (age < 13) {
        toast.error("You must be at least 13 years old");
        return;
      }

      if (age > 120) {
        toast.error("Invalid date of birth");
        return;
      }

      // Validate phone number (required)
      const trimmedPhone = formData.phoneNumber?.trim() || "";
      if (trimmedPhone === "") {
        toast.error("Phone number is required");
        return;
      }

      const phoneRegex = /^[+]?[\d\s\-()]+$/;
      if (!phoneRegex.test(trimmedPhone)) {
        toast.error(
          "Invalid phone number format. Use only numbers, spaces, +, -, ()"
        );
        return;
      }
      if (trimmedPhone.length < 10) {
        toast.error("Phone number must be at least 10 digits");
        return;
      }
      if (trimmedPhone.length > 20) {
        toast.error("Phone number must be less than 20 characters");
        return;
      }

      // Validate address (required)
      const trimmedAddress = formData.address?.trim() || "";
      if (trimmedAddress === "") {
        toast.error("Address is required");
        return;
      }

      if (trimmedAddress.length < 5) {
        toast.error("Address must be at least 5 characters");
        return;
      }
      if (trimmedAddress.length > 200) {
        toast.error("Address must be less than 200 characters");
        return;
      }

      let avatarUrl = formData.avatar;

      // Upload avatar to Cloudinary if changed
      if (avatarFile) {
        toast.loading("Uploading avatar to cloud...");
        avatarUrl = await uploadImage(avatarFile);
        // Update avatar on backend
        await updateAvatarMutation.mutateAsync(avatarUrl);
        toast.dismiss();
        toast.success("Avatar uploaded successfully!");
      }
      // Format dateOfBirth to ISO 8601 if provided
      let formattedDateOfBirth = formData.dateOfBirth;
      if (formattedDateOfBirth && formattedDateOfBirth.trim() !== "") {
        // Convert YYYY-MM-DD to ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ)
        const date = new Date(formattedDateOfBirth);
        if (!isNaN(date.getTime())) {
          formattedDateOfBirth = date.toISOString();
        }
      }

      // Prepare data for API call - all fields are now required
      const updateData = {
        name: trimmedName,
        avatar: avatarUrl,
        gender: formData.gender,
        dateOfBirth: formattedDateOfBirth,
        address: trimmedAddress,
        phoneNumber: trimmedPhone,
      };

      // Update profile information
      await updateProfileMutation.mutateAsync(updateData);

      toast.success(" Profile updated successfully!");
      setIsEditing(false);
      setAvatarFile(null);
    } catch (error: any) {
      console.error("Profile update error:", error);
      toast.dismiss(); // Dismiss any loading toast
      toast.error("Failed to update profile. Please try again.");
    }
  };

  const handleCancel = () => {
    // Reset form to cached profile data
    const profile = profileQuery.data;
    if (profile) {
      const avatarUrl = profile.avatar || "";
      let dateOfBirth = "";
      if (typeof profile.dateOfBirth === "string" && profile.dateOfBirth) {
        try {
          const date = new Date(profile.dateOfBirth);
          if (!isNaN(date.getTime())) {
            dateOfBirth = date.toISOString().split("T")[0];
          }
        } catch (e) {
          console.error("Invalid date format:", profile.dateOfBirth);
        }
      }
      setFormData({
        name: profile.name || "",
        email: profile.email || "",
        gender: profile.gender || "OTHER",
        dateOfBirth,
        address: typeof profile.address === "string" ? profile.address : "",
        phoneNumber:
          typeof profile.phoneNumber === "string" ? profile.phoneNumber : "",
        avatar: avatarUrl,
      });
      setAvatarPreview(avatarUrl);
    }
    setIsEditing(false);
    setImageError(false);
    setAvatarFile(null);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="bg-white/5 border-white/10">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white text-xl">
            Personal Information
          </CardTitle>
          {!isEditing && (
            <Button
              onClick={() => setIsEditing(true)}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              Edit Profile
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white/10">
              {avatarPreview && !imageError ? (
                <Image
                  src={avatarPreview}
                  alt="Avatar"
                  fill
                  className="object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  {formData.name ? (
                    <span className="text-4xl font-bold text-white">
                      {formData.name.charAt(0).toUpperCase()}
                    </span>
                  ) : (
                    <User className="w-16 h-16 text-white" />
                  )}
                </div>
              )}

              {/* Loading overlay when uploading */}
              {isUploading && (
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                  <span className="text-white text-xs font-medium">
                    {uploadProgress}%
                  </span>
                </div>
              )}

              {isEditing && !isUploading && (
                <label
                  htmlFor="avatar-upload"
                  className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer opacity-0 hover:opacity-100 transition-opacity"
                >
                  <Camera className="w-8 h-8 text-white" />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                    disabled={isUploading}
                  />
                </label>
              )}
            </div>
            {isEditing && !isUploading && (
              <p className="text-gray-400 text-sm">
                Click to upload new avatar
              </p>
            )}
            {isUploading && (
              <p className="text-purple-400 text-sm font-medium animate-pulse">
                Uploading image to cloud...
              </p>
            )}
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="bg-white/5 border-white/10 text-white disabled:opacity-50"
                placeholder="Enter your full name"
                required
              />
              {isEditing && !formData.name.trim() && (
                <p className="text-red-400 text-sm">Name is required</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">
                Email{" "}
                <span className="text-gray-500 text-sm">
                  (Cannot be changed)
                </span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled
                className="bg-white/5 border-white/10 text-white disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender" className="text-white">
                Gender <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.gender}
                onValueChange={(value: "MALE" | "FEMALE" | "OTHER") =>
                  setFormData((prev) => ({ ...prev, gender: value }))
                }
                disabled={!isEditing}
                required
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white disabled:opacity-50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth" className="text-white">
                Date of Birth <span className="text-red-500">*</span>
              </Label>
              <Input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="bg-white/5 border-white/10 text-white disabled:opacity-50"
                required
              />
              {isEditing && !formData.dateOfBirth.trim() && (
                <p className="text-red-400 text-sm">
                  Date of birth is required
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="text-white">
                Phone Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="bg-white/5 border-white/10 text-white disabled:opacity-50"
                placeholder="+84 xxx xxx xxx"
                required
              />
              {isEditing && !formData.phoneNumber.trim() && (
                <p className="text-red-400 text-sm">Phone number is required</p>
              )}
              {isEditing &&
                formData.phoneNumber.trim() !== "" &&
                formData.phoneNumber.trim().length < 10 && (
                  <p className="text-yellow-400 text-sm">
                    Phone number must be at least 10 digits
                  </p>
                )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="text-white">
                Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="address"
                name="address"
                type="text"
                value={formData.address}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="bg-white/5 border-white/10 text-white disabled:opacity-50"
                placeholder="Your address"
                required
              />
              {isEditing && !formData.address.trim() && (
                <p className="text-red-400 text-sm">Address is required</p>
              )}
              {isEditing &&
                formData.address.trim() !== "" &&
                formData.address.trim().length < 5 && (
                  <p className="text-yellow-400 text-sm">
                    Address must be at least 5 characters
                  </p>
                )}
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="space-y-4 pt-4">
              {isUploading && (
                <div className="space-y-2 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                      <span className="text-sm text-purple-400 font-medium">
                        Uploading to cloud...
                      </span>
                    </div>
                    <span className="text-sm text-purple-400 font-bold">
                      {uploadProgress}%
                    </span>
                  </div>
                  <Progress
                    value={uploadProgress}
                    className="h-2 bg-purple-950"
                  />
                </div>
              )}
              <div className="flex gap-4">
                <Button
                  onClick={handleSave}
                  disabled={isUploading}
                  className="flex-1 bg-gradient-to-r from-[#7C5CFF] to-[#A78BFA] hover:from-[#6B4EE6] hover:to-[#9673E6] text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleCancel}
                  disabled={isUploading}
                  variant="outline"
                  className="flex-1 border-white/20 text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
