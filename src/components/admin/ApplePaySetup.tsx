import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, AlertTriangle, Download, Upload, ExternalLink, Copy } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api/adminApi';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ApplePayConfig {
  merchant_id: string;
  domain_verified: boolean;
  certificate_uploaded: boolean;
  processing_certificate_id?: string;
  last_verified: string;
  domains: string[];
}

const ApplePaySetup = () => {
  const [merchantId, setMerchantId] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const queryClient = useQueryClient();

  const { data: applePayConfig, isLoading } = useQuery({
    queryKey: ['apple-pay-config'],
    queryFn: () => adminApi.getApplePayConfig(),
    staleTime: 5 * 60 * 1000,
  });

  const updateConfigMutation = useMutation({
    mutationFn: (config: { merchant_id: string }) => 
      adminApi.updateApplePayConfig(config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apple-pay-config'] });
      toast.success('Apple Pay configuration updated successfully!');
    },
    onError: (err: Error) => {
      toast.error(`Failed to update Apple Pay config: ${err.message}`);
    }
  });

  const uploadCertificateMutation = useMutation({
    mutationFn: (formData: FormData) => 
      adminApi.uploadApplePayCertificate(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apple-pay-config'] });
      toast.success('Apple Pay certificate uploaded successfully!');
      setSelectedFile(null);
    },
    onError: (err: Error) => {
      toast.error(`Failed to upload certificate: ${err.message}`);
    }
  });

  const verifyDomainMutation = useMutation({
    mutationFn: (domain: string) => 
      adminApi.verifyApplePayDomain(domain),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['apple-pay-config'] });
      toast.success(`Domain verification successful: ${data.message}`);
    },
    onError: (err: Error) => {
      toast.error(`Domain verification failed: ${err.message}`);
    }
  });

  const handleSaveConfig = () => {
    if (!merchantId.trim()) {
      toast.error('Please enter a valid Merchant ID');
      return;
    }
    updateConfigMutation.mutate({ merchant_id: merchantId });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.p12') && !file.name.endsWith('.pem')) {
        toast.error('Please select a .p12 or .pem certificate file');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUploadCertificate = () => {
    if (!selectedFile) {
      toast.error('Please select a certificate file first');
      return;
    }
    
    const formData = new FormData();
    formData.append('certificate', selectedFile);
    uploadCertificateMutation.mutate(formData);
  };

  const handleCopyDomainVerificationFile = () => {
    const verificationContent = `This file verifies domain ownership for Apple Pay.`;
    navigator.clipboard.writeText(verificationContent);
    toast.success('Domain verification content copied to clipboard');
  };

  const currentDomain = window.location.hostname;
  const isVerified = applePayConfig?.domain_verified || false;
  const isCertificateUploaded = applePayConfig?.certificate_uploaded || false;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold flex items-center">
          <div className="w-8 h-8 mr-2 bg-black rounded flex items-center justify-center">
            <span className="text-white font-bold text-sm">🍎</span>
          </div>
          Apple Pay Setup
        </h3>
        <Badge variant={isVerified && isCertificateUploaded ? 'default' : 'secondary'}>
          {isVerified && isCertificateUploaded ? 'Configured' : 'Setup Required'}
        </Badge>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="merchant">Merchant ID</TabsTrigger>
          <TabsTrigger value="domain">Domain Verification</TabsTrigger>
          <TabsTrigger value="certificate">Certificate</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Apple Pay Integration Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Merchant ID Configuration</h4>
                    <p className="text-sm text-muted-foreground">
                      {applePayConfig?.merchant_id ? `Configured: ${applePayConfig.merchant_id}` : 'Not configured'}
                    </p>
                  </div>
                  {applePayConfig?.merchant_id ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  )}
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Domain Verification</h4>
                    <p className="text-sm text-muted-foreground">
                      {isVerified ? `Verified for ${currentDomain}` : 'Domain not verified'}
                    </p>
                  </div>
                  {isVerified ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  )}
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Payment Processing Certificate</h4>
                    <p className="text-sm text-muted-foreground">
                      {isCertificateUploaded ? 'Certificate uploaded and active' : 'Certificate required'}
                    </p>
                  </div>
                  {isCertificateUploaded ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  )}
                </div>
              </div>

              {applePayConfig?.last_verified && (
                <div className="mt-4 text-sm text-muted-foreground">
                  Last verified: {new Date(applePayConfig.last_verified).toLocaleString()}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="merchant" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Apple Pay Merchant ID</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="merchantId">Merchant Identifier</Label>
                <Input
                  id="merchantId"
                  value={merchantId || applePayConfig?.merchant_id || ''}
                  onChange={(e) => setMerchantId(e.target.value)}
                  placeholder="merchant.com.yourcompany.appname"
                  className="font-mono"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Format: merchant.com.yourcompany.appname
                </p>
              </div>

              <Button 
                onClick={handleSaveConfig}
                disabled={updateConfigMutation.isPending}
                className="w-full"
              >
                {updateConfigMutation.isPending ? 'Saving...' : 'Save Merchant ID'}
              </Button>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">How to get your Merchant ID:</h4>
                <ol className="text-sm text-blue-700 space-y-1">
                  <li>1. Go to your Apple Developer Account</li>
                  <li>2. Navigate to Certificates, Identifiers & Profiles</li>
                  <li>3. Select Merchant IDs from the sidebar</li>
                  <li>4. Create a new Merchant ID or use an existing one</li>
                  <li>5. Copy the full Merchant ID (starts with "merchant.")</li>
                </ol>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => window.open('https://developer.apple.com/account/resources/identifiers/list/merchant', '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Apple Developer Portal
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="domain" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Domain Verification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Current Domain: {currentDomain}</h4>
                  <p className="text-sm text-muted-foreground">
                    Status: {isVerified ? 'Verified' : 'Not Verified'}
                  </p>
                </div>
                <Button
                  onClick={() => verifyDomainMutation.mutate(currentDomain)}
                  disabled={verifyDomainMutation.isPending}
                  variant={isVerified ? 'outline' : 'default'}
                >
                  {verifyDomainMutation.isPending ? 'Verifying...' : isVerified ? 'Re-verify' : 'Verify Domain'}
                </Button>
              </div>

              <div className="bg-gray-50 border rounded-lg p-4">
                <h4 className="font-medium mb-3">Domain Verification File</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  The verification file is automatically served at:
                </p>
                <code className="block bg-white p-2 rounded border font-mono text-sm">
                  https://{currentDomain}/.well-known/apple-developer-merchantid-domain-association
                </code>
                
                <div className="flex gap-2 mt-3">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(`https://${currentDomain}/.well-known/apple-developer-merchantid-domain-association`, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Test Verification URL
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleCopyDomainVerificationFile}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Content
                  </Button>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 mb-2">⚠️ Important:</h4>
                <p className="text-sm text-yellow-700">
                  After domain verification, you must also register this domain in your Apple Developer account 
                  under your Merchant ID settings.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certificate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Processing Certificate</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Certificate Status</h4>
                  <p className="text-sm text-muted-foreground">
                    {isCertificateUploaded ? 'Certificate uploaded and active' : 'No certificate uploaded'}
                  </p>
                  {applePayConfig?.processing_certificate_id && (
                    <p className="text-xs font-mono text-muted-foreground">
                      ID: {applePayConfig.processing_certificate_id}
                    </p>
                  )}
                </div>
                {isCertificateUploaded ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="certificate-upload">Upload Certificate (.p12 or .pem)</Label>
                <Input
                  id="certificate-upload"
                  type="file"
                  accept=".p12,.pem"
                  onChange={handleFileSelect}
                />
                {selectedFile && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </p>
                )}
                <Button
                  onClick={handleUploadCertificate}
                  disabled={!selectedFile || uploadCertificateMutation.isPending}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploadCertificateMutation.isPending ? 'Uploading...' : 'Upload Certificate'}
                </Button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">Certificate Setup Instructions:</h4>
                <ol className="text-sm text-blue-700 space-y-1">
                  <li>1. Go to Apple Developer Portal → Certificates</li>
                  <li>2. Create an "Apple Pay Payment Processing" certificate</li>
                  <li>3. Generate a Certificate Signing Request (CSR)</li>
                  <li>4. Download the certificate and export as .p12</li>
                  <li>5. Upload the .p12 file here</li>
                </ol>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => window.open('https://developer.apple.com/account/resources/certificates/list', '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Apple Certificates Portal
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApplePaySetup;